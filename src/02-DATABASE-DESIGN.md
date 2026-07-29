# طراحی دیتابیس (Database Design)

## نمای کلی ERD

```
┌──────────┐       ┌────────────┐       ┌──────────────┐
│  users   │───────│   roles    │       │ organizations│
└────┬─────┘       └────────────┘       └──────┬───────┘
     │                                          │
     │                                          │
     └──────┐                          ┌────────┘
            │                          │
      ┌─────▼──────────────────────────▼──────┐
      │              assets                    │  ← Tree (parent_id)
      │  (Company → Plant → Bespar → Position  │
      │   → Category → Equipment → SubSystem   │
      │   → Part → SubPart)                    │
      └────┬───────────────────────────────────┘
           │
     ┌─────┼───────┬──────────┬──────────┬─────────┐
     │     │       │          │          │         │
┌────▼┐ ┌──▼──┐ ┌──▼───┐ ┌───▼───┐ ┌────▼───┐ ┌───▼────┐
│work_│ │pm_  │ │failu-│ │asset_ │ │asset_  │ │spare_  │
│orders│ │plans│ │res   │ │docs   │ │meters  │ │parts   │
└──────┘ └─────┘ └──────┘ └───────┘ └────────┘ └────────┘
```

## Core Tables

### 1. `organizations` (سازمان)
| Field | Type | Description |
|---|---|---|
| id | serial PK | |
| name | text | نام سازمان |
| name_en | text | |
| logo_url | text | |
| tax_id | text | شناسه ملی |
| founded_year | int | ۱۳۹۲ |
| meta | jsonb | اطلاعات اضافی |
| created_at, updated_at | timestamp | |

### 2. `users`
| Field | Type | Description |
|---|---|---|
| id | serial PK | |
| username | text unique | |
| password_hash | text | bcrypt |
| full_name | text | |
| employee_code | text unique | کد پرسنلی |
| email | text | |
| phone | text | |
| avatar | text | |
| role_id | FK roles | |
| department | text | |
| position | text | |
| is_active | boolean | |
| last_login_at | timestamp | |

### 3. `roles`
| Field | Type | Description |
|---|---|---|
| id | serial PK | |
| name | text unique | |
| name_en | text | |
| level | int | 1-5 |
| permissions | jsonb | آرایه permissions |

**نقش‌های پیش‌فرض:**
- `super_admin` (5)
- `admin` (4)
- `manager` (3)
- `supervisor` (2)
- `technician` (1)

### 4. `permissions` (Enum-like)
```
assets.view, assets.create, assets.edit, assets.delete, assets.move
workorders.view, workorders.create, workorders.approve, workorders.close
maintenance.view, maintenance.execute
inventory.view, inventory.manage, inventory.order
personnel.view, personnel.manage
reports.view, reports.export
ai.use, ai.configure
settings.view, settings.edit
```

### 5. `asset_types` (نوع تجهیز)
Company / Plant / Bespar / Position / Category / Equipment / SubSystem / Part / SubPart

### 6. `assets` (تجهیزات — درختی نامحدود)
| Field | Type | Description |
|---|---|---|
| id | serial PK | |
| code | text unique | کد استاندارد ISO 14224 |
| name | text | |
| name_en | text | |
| parent_id | FK assets | خودارجاع |
| type_id | FK asset_types | |
| level | int | عمق در درخت |
| path | ltree/text | مسیر کامل: `1.2.5.12` |
| serial_number | text | |
| manufacturer | text | |
| model | text | |
| year_manufactured | int | |
| year_installed | int | |
| location | text | |
| coordinates | jsonb | {lat, lng, zone} |
| specifications | jsonb | مشخصات فنی |
| technical_data | jsonb | نامپلیت |
| criticality | text | low/medium/high/critical |
| status | text | active/inactive/maintenance/failed |
| health_score | decimal(5,2) | 0-100 |
| purchase_price | decimal | |
| purchase_date | date | |
| warranty_end | date | |
| mtbf | decimal | |
| mttr | decimal | |
| availability | decimal | |
| reliability | decimal | |
| failure_rate | decimal | |
| oee | decimal | |
| total_failures | int | |
| total_downtime | decimal | |
| last_maintenance | timestamp | |
| next_maintenance | timestamp | |
| tags | text[] | برچسب‌ها |
| meta | jsonb | فیلدهای دلخواه |

**Indexes:**
- `parent_id`, `path`, `code`, `status`, `criticality`

### 7. `asset_documents` (مدارک و فایل‌ها)
| Field | Type | Description |
|---|---|---|
| id | serial PK | |
| asset_id | FK assets | |
| type | text | manual/drawing/certificate/photo |
| title | text | |
| file_url | text | |
| file_size | int | bytes |
| mime_type | text | |
| uploaded_by | FK users | |

### 8. `asset_meters` (کنتور کارکرد)
| Field | Type | Description |
|---|---|---|
| id | serial PK | |
| asset_id | FK assets | |
| type | text | hours/cycles/km/kwh |
| unit | text | |
| current_value | decimal | |
| last_reading_at | timestamp | |

### 9. `asset_meter_readings` (تاریخچه)
| Field | Type | Description |
|---|---|---|
| id | serial PK | |
| meter_id | FK | |
| value | decimal | |
| read_by | FK users | |
| read_at | timestamp | |

## Maintenance Tables

### 10. `pm_plans` (برنامه‌های PM)
| Field | Type | Description |
|---|---|---|
| id | serial PK | |
| code | text unique | |
| title | text | |
| asset_id | FK assets | |
| type | text | time/meter/condition |
| interval_value | int | |
| interval_unit | text | days/weeks/months/hours/cycles |
| next_due_at | timestamp | |
| last_executed_at | timestamp | |
| assigned_to_id | FK users | |
| estimated_hours | decimal | |
| checklist | jsonb | آرایه آیتم‌ها |
| required_parts | jsonb | قطعات مورد نیاز |
| required_skills | jsonb | مهارت‌ها |
| priority | text | |
| is_active | boolean | |
| standard | text | ISO/TPM/RCM |

### 11. `pm_executions`
| Field | Type | Description |
|---|---|---|
| id | serial PK | |
| pm_plan_id | FK | |
| work_order_id | FK | |
| executed_by | FK users | |
| execution_date | timestamp | |
| status | text | completed/skipped/partial |
| findings | text | |
| checklist_results | jsonb | |
| parts_used | jsonb | |
| hours_spent | decimal | |
| cost | decimal | |

### 12. `work_orders` (دستور کار)
| Field | Type | Description |
|---|---|---|
| id | serial PK | |
| order_number | text unique | `WO-1403-1001` |
| title | text | |
| description | text | |
| type | text | preventive/corrective/predictive/emergency |
| priority | text | low/medium/high/critical |
| status | text | draft/pending_approval/approved/in_progress/on_hold/completed/cancelled |
| asset_id | FK | |
| pm_plan_id | FK nullable | |
| failure_id | FK nullable | |
| requested_by | FK users | |
| approved_by | FK users | |
| assigned_to | FK users | |
| team_ids | int[] | تیم چندنفره |
| scheduled_start | timestamp | |
| scheduled_end | timestamp | |
| actual_start | timestamp | |
| actual_end | timestamp | |
| estimated_hours | decimal | |
| actual_hours | decimal | |
| estimated_cost | decimal | |
| actual_cost | decimal | |
| checklist | jsonb | |
| parts_used | jsonb | |
| photos | text[] | |
| notes | text | |

### 13. `work_order_history` (Audit)
| Field | Type | Description |
|---|---|---|
| id | serial PK | |
| work_order_id | FK | |
| action | text | created/approved/started/... |
| by | FK users | |
| from_status | text | |
| to_status | text | |
| note | text | |
| created_at | timestamp | |

### 14. `failures` (خرابی‌ها)
| Field | Type | Description |
|---|---|---|
| id | serial PK | |
| code | text unique | |
| asset_id | FK | |
| title | text | |
| description | text | |
| failure_mode | text | ISO 14224 |
| failure_type | text | mechanical/electrical/... |
| severity | text | |
| status | text | open/investigating/resolved/closed |
| detection_method | text | operator/inspection/sensor/AI |
| downtime_start | timestamp | |
| downtime_end | timestamp | |
| downtime_hours | decimal | |
| cost | decimal | |
| reported_by | FK users | |
| work_order_id | FK | |

### 15. `rca_analyses` (تحلیل علت ریشه‌ای)
| Field | Type | Description |
|---|---|---|
| id | serial PK | |
| failure_id | FK | |
| method | text | 5Why/Fishbone/FaultTree |
| root_cause | text | |
| immediate_cause | text | |
| contributing_factors | jsonb | |
| corrective_actions | jsonb | |
| preventive_actions | jsonb | |
| responsible | FK users | |
| deadline | date | |
| ai_generated | boolean | |
| ai_confidence | decimal | |

### 16. `fmea_analyses` (تحلیل FMEA)
| Field | Type | Description |
|---|---|---|
| id | serial PK | |
| asset_id | FK | |
| function | text | |
| failure_mode | text | |
| effect | text | |
| cause | text | |
| severity | int | 1-10 |
| occurrence | int | 1-10 |
| detection | int | 1-10 |
| rpn | int computed | S × O × D |
| recommended_action | text | |
| responsible | FK users | |

## Inventory Tables

### 17. `spare_parts`
### 18. `categories`
### 19. `suppliers`
### 20. `inventory_transactions`
### 21. `purchase_orders`
### 22. `asset_parts` (junction)

## HR Tables

### 23. `skills`
### 24. `user_skills` (junction با proficiency 1-5)
### 25. `shifts`
### 26. `user_shifts`
### 27. `certifications`

## AI Tables

### 28. `ai_imports` (تاریخچه Import)
| Field | Type | Description |
|---|---|---|
| id | serial PK | |
| source_type | text | excel/pdf/image/word |
| source_file | text | |
| status | text | processing/completed/failed |
| detected_columns | jsonb | |
| mapping | jsonb | |
| preview_data | jsonb | |
| imported_count | int | |
| error_count | int | |
| errors | jsonb | |
| by_user | FK users | |

### 29. `ai_predictions`
| Field | Type | Description |
|---|---|---|
| id | serial PK | |
| type | text | failure/mtbf/maintenance/inventory |
| target_type | text | asset/part |
| target_id | int | |
| prediction | jsonb | |
| confidence | decimal | 0-1 |
| valid_until | timestamp | |
| model_version | text | |

### 30. `ai_conversations` (مشاور هوشمند)
| Field | Type | Description |
|---|---|---|
| id | serial PK | |
| user_id | FK | |
| context_type | text | asset/global |
| context_id | int | |
| messages | jsonb | آرایه پیام‌ها |

## System Tables

### 31. `notifications`
### 32. `audit_logs` (تمام عملیات)
### 33. `settings` (Key-Value)
### 34. `backups`
### 35. `dashboard_widgets` (چیدمان دلخواه)

## Constraints & Indexes

```sql
-- Composite indexes
CREATE INDEX idx_assets_parent_status ON assets(parent_id, status);
CREATE INDEX idx_workorders_asset_status ON work_orders(asset_id, status);
CREATE INDEX idx_failures_asset_date ON failures(asset_id, created_at DESC);

-- Full-text search
CREATE INDEX idx_assets_search ON assets USING gin(to_tsvector('simple', name || ' ' || code));

-- Partial indexes
CREATE INDEX idx_active_pm ON pm_plans(next_due_at) WHERE is_active = true;
CREATE INDEX idx_open_wo ON work_orders(scheduled_start) WHERE status IN ('approved', 'in_progress');
```

## Data Migration Strategy

1. **Access Import:** ODBC → CSV → Drizzle Seed
2. **Excel Import:** SheetJS parsing → AI mapping → Bulk insert
3. **PDF Import:** OCR → NER → Structured data

## Backup Strategy

- **روزانه:** pg_dump → local + S3
- **هفتگی:** Full snapshot
- **ماهانه:** Archive → cold storage
- **Retention:** 10 سال (طبق ISO)
