-- =====================================================
-- 📊 دیتابیس سامانه CMMS/EAM بسپارفوم غرب (SELEN Group)
-- =====================================================
-- Version: 1.0.0
-- Database: PostgreSQL 14+
-- Encoding: UTF8
-- Collation: en_US.UTF-8 (Persian text stored as UTF-8)
--
-- Usage:
--   psql -U postgres -c "CREATE DATABASE baspar_cmms;"
--   psql -U postgres -d baspar_cmms -f 01-schema.sql
--   psql -U postgres -d baspar_cmms -f 02-seed-data.sql
--   psql -U postgres -d baspar_cmms -f 03-mock-history.sql
--   psql -U postgres -d baspar_cmms -f 04-indexes.sql
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- SECTION 1: COMPANY & USERS
-- =====================================================

CREATE TABLE company_profile (
  id             INTEGER PRIMARY KEY DEFAULT 1,
  name           VARCHAR(200) NOT NULL,
  name_en        VARCHAR(200),
  industry       VARCHAR(200),
  address        TEXT,
  phone          VARCHAR(50),
  email          VARCHAR(200),
  website        VARCHAR(200),
  ceo            VARCHAR(200),
  established    VARCHAR(20),
  employee_count INTEGER DEFAULT 0,
  factories      TEXT[], -- array of factory names
  description    TEXT,
  logo_url       TEXT,
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'supervisor', 'technician', 'operator', 'viewer');
CREATE TYPE login_provider AS ENUM ('password', 'google');

CREATE TABLE users (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                  VARCHAR(200) NOT NULL,
  email                 VARCHAR(200) NOT NULL UNIQUE,
  password_hash         VARCHAR(255) NOT NULL,
  role                  user_role NOT NULL DEFAULT 'technician',
  department            VARCHAR(200),
  job_title             VARCHAR(200),
  phone                 VARCHAR(50),
  avatar                TEXT,                    -- data URL or file path
  skills                TEXT[],                  -- array of skills
  performance           SMALLINT DEFAULT 80 CHECK (performance BETWEEN 0 AND 100),
  active                BOOLEAN DEFAULT TRUE,
  joined_at             DATE DEFAULT CURRENT_DATE,
  last_login_at         TIMESTAMPTZ,
  must_change_password  BOOLEAN DEFAULT FALSE,
  login_provider        login_provider DEFAULT 'password',
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_certifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(200) NOT NULL,
  expiry     DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE pending_request_type AS ENUM ('signup', 'google_login', 'password_reset');
CREATE TYPE pending_request_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE pending_requests (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type        pending_request_type NOT NULL,
  name        VARCHAR(200) NOT NULL,
  email       VARCHAR(200) NOT NULL,
  phone       VARCHAR(50),
  department  VARCHAR(200),
  job_title   VARCHAR(200),
  message     TEXT,
  status      pending_request_status DEFAULT 'pending',
  reviewed_by VARCHAR(200),
  reviewed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SECTION 2: EQUIPMENT / ASSETS
-- =====================================================

CREATE TYPE equipment_status AS ENUM ('active', 'maintenance', 'inactive', 'scrapped');
CREATE TYPE criticality_level AS ENUM ('critical', 'high', 'medium', 'low');

CREATE TABLE equipment (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id         UUID REFERENCES equipment(id) ON DELETE SET NULL,
  code              VARCHAR(100) NOT NULL UNIQUE,
  name              VARCHAR(300) NOT NULL,
  category          VARCHAR(100),
  department        VARCHAR(100),
  location          VARCHAR(200),
  manufacturer      VARCHAR(200),
  model             VARCHAR(200),
  serial            VARCHAR(200),
  year              INTEGER,
  purchase_date     DATE,
  purchase_cost     NUMERIC(20, 0) DEFAULT 0,
  status            equipment_status DEFAULT 'active',
  criticality       criticality_level DEFAULT 'medium',
  health_score      SMALLINT DEFAULT 85 CHECK (health_score BETWEEN 0 AND 100),
  rul_days          INTEGER DEFAULT 720,        -- Remaining Useful Life
  predicted_failure DATE,
  notes             TEXT,
  -- Extended technical specs
  capacity          VARCHAR(100),
  power             VARCHAR(100),
  voltage           VARCHAR(100),
  weight            VARCHAR(100),
  -- Custom fields (dynamic key-value from imported datasheets)
  custom_fields     JSONB DEFAULT '{}'::jsonb,
  source_file       VARCHAR(300),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE equipment_document_type AS ENUM ('manual', 'certificate', 'photo', 'datasheet', 'invoice', 'other');

CREATE TABLE equipment_documents (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  name         VARCHAR(300) NOT NULL,
  type         equipment_document_type DEFAULT 'other',
  url          TEXT NOT NULL,                   -- Can be file path or data URL
  size_bytes   BIGINT,
  uploaded_by  VARCHAR(200),
  uploaded_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SECTION 3: WORK ORDERS
-- =====================================================

CREATE TYPE wo_type AS ENUM ('corrective', 'preventive', 'predictive', 'emergency', 'improvement', 'inspection', 'project');
CREATE TYPE wo_status AS ENUM ('draft', 'submitted', 'approved', 'assigned', 'in_progress', 'verification', 'completed', 'closed');
CREATE TYPE wo_priority AS ENUM ('critical', 'high', 'medium', 'low');

CREATE TABLE work_orders (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number              VARCHAR(50) NOT NULL UNIQUE,
  title               VARCHAR(500) NOT NULL,
  description         TEXT,
  type                wo_type NOT NULL DEFAULT 'corrective',
  priority            wo_priority DEFAULT 'medium',
  status              wo_status DEFAULT 'draft',
  equipment_id        UUID REFERENCES equipment(id) ON DELETE SET NULL,
  department          VARCHAR(100),
  requested_by        UUID REFERENCES users(id) ON DELETE SET NULL,
  planned_start       TIMESTAMPTZ NOT NULL,
  planned_end         TIMESTAMPTZ NOT NULL,
  actual_start        TIMESTAMPTZ,
  actual_end          TIMESTAMPTZ,
  estimated_cost      NUMERIC(20, 0) DEFAULT 0,
  actual_cost         NUMERIC(20, 0) DEFAULT 0,
  labor_hours         NUMERIC(6, 2) DEFAULT 0,
  root_cause          TEXT,
  corrective_action   TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Many-to-many: WO assigned to multiple users
CREATE TABLE wo_assignments (
  wo_id      UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (wo_id, user_id)
);

-- Track when each user viewed the WO
CREATE TABLE wo_views (
  wo_id      UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewed_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (wo_id, user_id)
);

CREATE TYPE attachment_kind AS ENUM ('before', 'after');

CREATE TABLE wo_attachments (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wo_id      UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  kind       attachment_kind NOT NULL,
  url        TEXT NOT NULL,                     -- data URL or file path
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE wo_voice_notes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wo_id      UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  transcript TEXT,
  duration_seconds INTEGER,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE wo_text_notes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wo_id      UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  author     VARCHAR(200),
  text       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE wo_parts_used (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wo_id      UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  part_id    UUID,                              -- FK to spare_parts (nullable for external items)
  qty        NUMERIC(10, 2) NOT NULL DEFAULT 1,
  cost       NUMERIC(20, 0) DEFAULT 0,
  notes      TEXT
);

-- =====================================================
-- SECTION 4: PREVENTIVE MAINTENANCE (PM)
-- =====================================================

CREATE TYPE pm_frequency AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'semiannual', 'annual');
CREATE TYPE pm_task_type AS ENUM ('inspection', 'lubrication', 'calibration', 'cleaning', 'replacement', 'adjustment', 'testing', 'overhaul');

CREATE TABLE pm_plans (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(300) NOT NULL,
  equipment_id  UUID REFERENCES equipment(id) ON DELETE CASCADE,
  frequency     pm_frequency NOT NULL,
  task_type     pm_task_type NOT NULL,
  assigned_to   UUID REFERENCES users(id) ON DELETE SET NULL,
  next_due      TIMESTAMPTZ NOT NULL,
  last_done     TIMESTAMPTZ,
  compliance    SMALLINT DEFAULT 100 CHECK (compliance BETWEEN 0 AND 100),
  active        BOOLEAN DEFAULT TRUE,
  duration_min  INTEGER,
  skill_level   VARCHAR(100),
  acceptance_criteria TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pm_checklist_items (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pm_id      UUID NOT NULL REFERENCES pm_plans(id) ON DELETE CASCADE,
  item_text  TEXT NOT NULL,
  done       BOOLEAN DEFAULT FALSE,
  order_num  SMALLINT DEFAULT 0
);

-- =====================================================
-- SECTION 5: INVENTORY (SPARE PARTS)
-- =====================================================

CREATE TABLE suppliers (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       VARCHAR(300) NOT NULL,
  contact    VARCHAR(200),
  phone      VARCHAR(50),
  email      VARCHAR(200),
  rating     NUMERIC(3, 1) DEFAULT 4.0 CHECK (rating BETWEEN 0 AND 5),
  lead_days  INTEGER DEFAULT 7,
  address    TEXT,
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE spare_parts (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code                      VARCHAR(100) NOT NULL UNIQUE,
  name                      VARCHAR(300) NOT NULL,
  category                  VARCHAR(100),
  unit                      VARCHAR(50) DEFAULT 'عدد',
  unit_cost                 NUMERIC(20, 0) DEFAULT 0,
  stock                     NUMERIC(12, 2) DEFAULT 0,
  min_stock                 NUMERIC(12, 2) DEFAULT 5,
  max_stock                 NUMERIC(12, 2) DEFAULT 50,
  warehouse                 VARCHAR(200),
  bin                       VARCHAR(100),
  supplier_id               UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  consumption_forecast_30   NUMERIC(10, 2) DEFAULT 0,
  consumption_forecast_90   NUMERIC(10, 2) DEFAULT 0,
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SECTION 6: NOTIFICATIONS
-- =====================================================

CREATE TYPE notification_type AS ENUM ('wo_new', 'wo_assigned', 'wo_due', 'wo_overdue', 'pm_due', 'inventory_low', 'approval', 'ai_insight');
CREATE TYPE notification_channel AS ENUM ('inapp', 'push', 'email', 'whatsapp', 'bale', 'sms');

CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  type       notification_type NOT NULL,
  title      VARCHAR(300) NOT NULL,
  body       TEXT,
  channels   notification_channel[] DEFAULT ARRAY['inapp']::notification_channel[],
  read       BOOLEAN DEFAULT FALSE,
  link       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SECTION 7: AUDIT LOG
-- =====================================================

CREATE TABLE audit_log (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_name  VARCHAR(200),
  user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  action     VARCHAR(300) NOT NULL,
  module     VARCHAR(100),
  target     VARCHAR(200),
  ip_address INET,
  user_agent TEXT,
  metadata   JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SECTION 8: FILE REPOSITORY (Excel archive)
-- =====================================================

CREATE TABLE excel_files (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         VARCHAR(300) NOT NULL,
  file_url     TEXT,                            -- storage path
  size_bytes   BIGINT,
  version      INTEGER DEFAULT 1,
  uploaded_by  VARCHAR(200),
  uploaded_at  TIMESTAMPTZ DEFAULT NOW(),
  sheets       TEXT[],
  checksum     VARCHAR(128),
  preview      TEXT
);

-- =====================================================
-- SECTION 9: MAPPING TEMPLATES (AI Learning)
-- =====================================================

CREATE TYPE mapping_target AS ENUM ('equipment', 'workorders', 'pm', 'inventory', 'personnel', 'suppliers');

CREATE TABLE mapping_templates (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         VARCHAR(300) NOT NULL,
  target       mapping_target NOT NULL,
  fingerprint  VARCHAR(500) NOT NULL,
  headers      TEXT[],
  mapping      JSONB NOT NULL,                  -- { field_name: excel_column }
  usage_count  INTEGER DEFAULT 1,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SECTION 10: ATTENDANCE & LEAVES
-- =====================================================

CREATE TYPE attendance_type AS ENUM ('clock_in', 'clock_out');
CREATE TYPE attendance_source AS ENUM ('manual', 'auto', 'admin');

CREATE TABLE attendance (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       attendance_type NOT NULL,
  at         TIMESTAMPTZ DEFAULT NOW(),
  note       TEXT,
  source     attendance_source DEFAULT 'manual',
  ip_address INET
);

CREATE TYPE leave_type AS ENUM ('استحقاقی', 'استعلاجی', 'بدون حقوق', 'ساعتی', 'مأموریت', 'سایر');
CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE leaves (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type         leave_type NOT NULL,
  start_date   DATE NOT NULL,
  end_date     DATE NOT NULL,
  start_time   TIME,
  end_time     TIME,
  reason       TEXT,
  status       leave_status DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by  VARCHAR(200),
  reviewed_at  TIMESTAMPTZ,
  review_note  TEXT
);

-- =====================================================
-- SECTION 11: SERVICE REQUESTS (BFG-FR-27-V2)
-- =====================================================

CREATE TYPE service_action_type AS ENUM ('تعمیر اضطراری', 'پیشگیرانه', 'خدمات', 'ساخت ابزار تولیدی/کنترلی');
CREATE TYPE service_type AS ENUM ('تأسیسات', 'برقی', 'هیدرولیکی', 'سایر');
CREATE TYPE service_urgency AS ENUM ('فوق العاده ضروری', 'ضروری');
CREATE TYPE service_repair_method AS ENUM ('داخلی', 'خارجی (بیرون از شرکت)');
CREATE TYPE service_status AS ENUM ('pending', 'in_progress', 'completed', 'rejected');

CREATE TABLE service_requests (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_number      VARCHAR(50) NOT NULL UNIQUE,
  request_date        TIMESTAMPTZ DEFAULT NOW(),
  action_type         service_action_type,
  service_type_v      service_type,
  equipment_name      VARCHAR(300),
  equipment_code      VARCHAR(100),
  equipment_id        UUID REFERENCES equipment(id) ON DELETE SET NULL,
  install_location    VARCHAR(200),
  fault_date_time     TIMESTAMPTZ,
  fault_description   TEXT NOT NULL,
  additional_info     TEXT,
  caused_stop         BOOLEAN,
  stop_date_time      TIMESTAMPTZ,
  urgency             service_urgency,
  requesting_unit     VARCHAR(200),
  requested_by        VARCHAR(200),
  -- Section 2: مسئول نت
  fault_cause_diagnosis  TEXT,
  repair_method       service_repair_method,
  external_contractor VARCHAR(300),
  nt_manager_name     VARCHAR(200),
  management_approval VARCHAR(200),
  -- Section 3: شرح کار انجام‌شده
  work_description    TEXT,
  start_date_time     TIMESTAMPTZ,
  end_date_time       TIMESTAMPTZ,
  net_duration        VARCHAR(50),
  -- Section 4: تحویل
  maintenance_signatory VARCHAR(200),
  requester_signatory VARCHAR(200),
  downtime_hours      VARCHAR(50),
  -- Section 5: رسید تحویل
  delivery_to         VARCHAR(200),
  delivery_receipt_number VARCHAR(50),
  delivery_date       DATE,
  delivery_time       TIME,
  status              service_status DEFAULT 'pending',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE service_request_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id    UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  description   VARCHAR(500),
  qty_or_hours  VARCHAR(50),
  cost          VARCHAR(50),
  notes         TEXT,
  order_num     SMALLINT DEFAULT 0
);

-- =====================================================
-- SECTION 12: TRIGGERS & FUNCTIONS
-- =====================================================

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_equipment_updated_at BEFORE UPDATE ON equipment
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_wo_updated_at BEFORE UPDATE ON work_orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_pm_updated_at BEFORE UPDATE ON pm_plans
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_parts_updated_at BEFORE UPDATE ON spare_parts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_sr_updated_at BEFORE UPDATE ON service_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =====================================================
-- SECTION 13: VIEWS (helpers for reports)
-- =====================================================

-- Equipment tree with full path
CREATE OR REPLACE VIEW equipment_with_path AS
WITH RECURSIVE tree AS (
  SELECT id, parent_id, code, name, department, location, 1 AS depth,
         name::TEXT AS full_path, ARRAY[name] AS path_array
  FROM equipment WHERE parent_id IS NULL
  UNION ALL
  SELECT e.id, e.parent_id, e.code, e.name, e.department, e.location, t.depth + 1,
         (t.full_path || ' → ' || e.name)::TEXT, t.path_array || e.name
  FROM equipment e
  INNER JOIN tree t ON e.parent_id = t.id
)
SELECT * FROM tree;

-- Personnel attendance summary per day
CREATE OR REPLACE VIEW attendance_daily_summary AS
SELECT
  a.user_id,
  u.name,
  u.department,
  DATE(a.at AT TIME ZONE 'Asia/Tehran') AS work_date,
  MIN(CASE WHEN a.type = 'clock_in' THEN a.at END) AS first_in,
  MAX(CASE WHEN a.type = 'clock_out' THEN a.at END) AS last_out,
  COUNT(*) FILTER (WHERE a.type = 'clock_in') AS entries,
  COUNT(*) FILTER (WHERE a.type = 'clock_out') AS exits
FROM attendance a
JOIN users u ON u.id = a.user_id
GROUP BY a.user_id, u.name, u.department, DATE(a.at AT TIME ZONE 'Asia/Tehran');

-- WO statistics per equipment
CREATE OR REPLACE VIEW wo_stats_per_equipment AS
SELECT
  e.id AS equipment_id,
  e.code,
  e.name,
  COUNT(*) AS total_wo,
  COUNT(*) FILTER (WHERE w.status IN ('completed', 'closed')) AS completed_wo,
  COUNT(*) FILTER (WHERE w.status NOT IN ('completed', 'closed')) AS open_wo,
  COUNT(*) FILTER (WHERE w.type = 'preventive') AS preventive_count,
  COUNT(*) FILTER (WHERE w.type IN ('corrective', 'emergency')) AS corrective_count,
  COALESCE(SUM(w.actual_cost), 0) AS total_actual_cost,
  COALESCE(SUM(w.labor_hours), 0) AS total_labor_hours
FROM equipment e
LEFT JOIN work_orders w ON w.equipment_id = e.id
GROUP BY e.id, e.code, e.name;

-- =====================================================
-- END OF SCHEMA
-- =====================================================
COMMENT ON DATABASE current_database IS 'Baspar Foam Gharb CMMS/EAM v1.0';
