# نقشه راه توسعه (Development Roadmap)

## Overview
پروژه در ۱۰ فاز مستقل توسعه می‌یابد. هر فاز:
- Deployable
- Testable
- منتظر تأیید کارفرما قبل از فاز بعدی

## Phase 0 — Architecture & Design (فعلی)
**مدت:** ۱-۲ روز
**خروجی:**
- ✅ Project Charter
- ✅ Architecture Document
- ✅ Database Design (35 table)
- ✅ UI Design System
- ✅ Development Roadmap (این سند)
- ✅ Product Backlog
- ✅ API Structure
- ✅ Coding Standards
- ✅ Folder Structure

**Deployable:** فقط مستندات

---

## Phase 1 — UI Framework & Skeleton
**مدت:** ۲-۳ روز
**Deliverables:**
- Design tokens (CSS variables)
- Theme system (Dark/Light) با تغییر لحظه‌ای
- Layout: Header + Sidebar + Footer + Main
- Sidebar با گروه‌بندی منوها
- Toggle Button روی لبه چپ سایدبار
- Bottom Navigation موبایل
- Typography scale
- Animations (fade/slide/pulse)
- Responsive breakpoints
- Empty States
- Loading States (Skeleton)
- Notification Panel اسکلت
- Modal System (Center + Bottom Sheet)
- Toast System

**Deployable:** ✅ Staging Link

---

## Phase 2 — Asset Management (تجهیزات)
**مدت:** ۴-۵ روز
**Deliverables:**
- درخت تجهیزات نامحدود (Recursive)
- کشیدن و رها کردن (Drag & Drop)
- Search + Filter پیشرفته
- Breadcrumb navigation
- Zoom & Mini Map
- Add/Edit/Delete/Move
- Bulk operations
- Import اولیه Excel
- Tree Animation
- Node Icons per Type

**Deployable:** ✅

---

## Phase 3 — Asset Workspace (صفحه اختصاصی تجهیز)
**مدت:** ۳-۴ روز
**Deliverables:**
- تب‌بندی: شناسنامه / قطعات / زیرسیستم / سوابق / مدارک / KPI
- Photo Gallery
- Documents upload
- Timeline از سوابق
- Related Assets
- Meter Readings
- Health Score
- QR Code تولید
- Print / PDF Export

**Deployable:** ✅

---

## Phase 4 — Maintenance (PM/CM/PdM)
**مدت:** ۴-۵ روز
**Deliverables:**
- PM Plans با interval زمانی/کارکردی
- Checklists (drag & drop)
- Lubrication Routes
- Inspection Rounds
- Calendar View
- Timeline View
- Auto-generation از WO
- Trigger Conditions

**Deployable:** ✅

---

## Phase 5 — Work Order System
**مدت:** ۴ روز
**Deliverables:**
- Work Order CRUD
- Approval Workflow (Draft → Approval → Approved → In Progress → Completed)
- Assignment
- Team Collaboration
- Time Tracking
- Cost Tracking
- Parts Consumption
- Photo Attachments
- Signature Capture

**Deployable:** ✅

---

## Phase 6 — Personnel & Skills
**مدت:** ۳ روز
**Deliverables:**
- Personnel CRUD
- Skill Matrix
- Certifications
- Shift Management
- Assignment Board
- Workload View
- Performance KPI

**Deployable:** ✅

---

## Phase 7 — Inventory
**مدت:** ۴ روز
**Deliverables:**
- Spare Parts CRUD
- Suppliers
- Warehouse locations
- Stock In/Out
- Reorder Points
- Barcode/QR
- Consumption History
- Purchase Orders
- Low Stock Alerts

**Deployable:** ✅

---

## Phase 8 — Reports & KPI
**مدت:** ۳ روز
**Deliverables:**
- Dashboard مدیریتی
- Custom Widget Builder
- Charts (Bar, Line, Pie, Radar, Gauge, Heatmap)
- KPI Cards
- Pareto Analysis
- Filter Panel
- Export Excel/PDF/Word/CSV (واقعی)
- Scheduled Reports
- Email delivery

**Deployable:** ✅

---

## Phase 9 — AI & ML
**مدت:** ۵-۶ روز
**Deliverables:**
- AI Asset Import (Excel/PDF/OCR/Image)
- Column Detection
- Duplicate Detection
- Auto Field Mapping
- Predictive Maintenance
- RCA Assistant (5Why + Fishbone auto)
- FMEA Generator
- MTBF/MTTR/OEE Predictor
- مشاور هوشمند نت‌سلن (Chat)
- Recommendation Engine
- Anomaly Detection

**Deployable:** ✅

---

## Phase 10 — Enterprise Features
**مدت:** ۳ روز
**Deliverables:**
- RBAC کامل
- Audit Log UI
- Backup/Restore
- Multi-tenant
- API Documentation
- SSO (Optional)
- Rate Limiting
- Health Monitoring

**Deployable:** ✅ Final Release

---

## Timeline Summary

| Phase | Days | Cumulative |
|---|---|---|
| Phase 0 | 2 | 2 |
| Phase 1 | 3 | 5 |
| Phase 2 | 5 | 10 |
| Phase 3 | 4 | 14 |
| Phase 4 | 5 | 19 |
| Phase 5 | 4 | 23 |
| Phase 6 | 3 | 26 |
| Phase 7 | 4 | 30 |
| Phase 8 | 3 | 33 |
| Phase 9 | 6 | 39 |
| Phase 10 | 3 | 42 |
| **Total** | **~42 روز** | |

## Definition of Done (DoD) — هر فاز
- ✅ کد نوشته و review شده
- ✅ Type-check pass
- ✅ Build موفق
- ✅ Deploy روی Staging
- ✅ لینک قابل دسترس
- ✅ گزارش Changelog
- ✅ تأیید کارفرما

## Rollback Strategy
- هر فاز Tag می‌شود
- در صورت مشکل، بازگشت به Tag قبلی
- Database migration reversible
