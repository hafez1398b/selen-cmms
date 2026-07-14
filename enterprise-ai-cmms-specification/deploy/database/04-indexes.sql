-- =====================================================
-- 🔍 Indexes for Performance
-- =====================================================

BEGIN;

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);

-- Equipment
CREATE INDEX IF NOT EXISTS idx_equipment_parent ON equipment(parent_id);
CREATE INDEX IF NOT EXISTS idx_equipment_code ON equipment(code);
CREATE INDEX IF NOT EXISTS idx_equipment_department ON equipment(department);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
CREATE INDEX IF NOT EXISTS idx_equipment_criticality ON equipment(criticality);
CREATE INDEX IF NOT EXISTS idx_equipment_custom_fields ON equipment USING GIN(custom_fields);

-- Full-text search on equipment (Persian + English)
CREATE INDEX IF NOT EXISTS idx_equipment_search ON equipment
  USING GIN(to_tsvector('simple', name || ' ' || code || ' ' || COALESCE(serial, '') || ' ' || COALESCE(manufacturer, '')));

-- Work Orders (most-queried table)
CREATE INDEX IF NOT EXISTS idx_wo_equipment ON work_orders(equipment_id);
CREATE INDEX IF NOT EXISTS idx_wo_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_wo_type ON work_orders(type);
CREATE INDEX IF NOT EXISTS idx_wo_priority ON work_orders(priority);
CREATE INDEX IF NOT EXISTS idx_wo_department ON work_orders(department);
CREATE INDEX IF NOT EXISTS idx_wo_planned_start ON work_orders(planned_start DESC);
CREATE INDEX IF NOT EXISTS idx_wo_planned_end ON work_orders(planned_end);
CREATE INDEX IF NOT EXISTS idx_wo_created_at ON work_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wo_number ON work_orders(number);
CREATE INDEX IF NOT EXISTS idx_wo_open ON work_orders(status) WHERE status NOT IN ('completed', 'closed');

-- WO assignments
CREATE INDEX IF NOT EXISTS idx_wo_assign_user ON wo_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_wo_assign_wo ON wo_assignments(wo_id);

-- PM
CREATE INDEX IF NOT EXISTS idx_pm_equipment ON pm_plans(equipment_id);
CREATE INDEX IF NOT EXISTS idx_pm_next_due ON pm_plans(next_due) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_pm_assigned ON pm_plans(assigned_to);

-- Spare parts
CREATE INDEX IF NOT EXISTS idx_parts_code ON spare_parts(code);
CREATE INDEX IF NOT EXISTS idx_parts_category ON spare_parts(category);
CREATE INDEX IF NOT EXISTS idx_parts_supplier ON spare_parts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_parts_low_stock ON spare_parts(id) WHERE stock < min_stock;

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_unread ON notifications(user_id) WHERE read = FALSE;

-- Audit log
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_module ON audit_log(module);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);

-- Attendance
CREATE INDEX IF NOT EXISTS idx_attendance_user ON attendance(user_id, at DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_at ON attendance(at DESC);

-- Leaves
CREATE INDEX IF NOT EXISTS idx_leaves_user ON leaves(user_id);
CREATE INDEX IF NOT EXISTS idx_leaves_status ON leaves(status);
CREATE INDEX IF NOT EXISTS idx_leaves_dates ON leaves(start_date, end_date);

-- Service requests
CREATE INDEX IF NOT EXISTS idx_sr_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_sr_receipt ON service_requests(receipt_number);
CREATE INDEX IF NOT EXISTS idx_sr_equipment ON service_requests(equipment_id);
CREATE INDEX IF NOT EXISTS idx_sr_created ON service_requests(created_at DESC);

-- Excel files
CREATE INDEX IF NOT EXISTS idx_excel_uploaded ON excel_files(uploaded_at DESC);

-- Mapping templates
CREATE INDEX IF NOT EXISTS idx_mapping_fingerprint ON mapping_templates(fingerprint);
CREATE INDEX IF NOT EXISTS idx_mapping_target ON mapping_templates(target);

COMMIT;

ANALYZE;

SELECT 'All indexes created successfully' AS status;
