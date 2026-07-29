# Phase 3 Changelog — Asset Workspace

## نسخه: v0.4.0-phase-3

## هدف
ساخت صفحه اختصاصی هر تجهیز با تب‌بندی کامل و تمام اطلاعات

## Deliverables

### ✅ Asset Workspace Layout
- Header با اطلاعات کلیدی
- Breadcrumb مسیر کامل
- Status Badge, Health Score, Criticality
- Quick Actions (Edit, QR, Print, Share)

### ✅ Tabs
1. **شناسنامه** (Identity) — تمام مشخصات
2. **KPI و شاخص‌ها** — MTBF/MTTR/OEE + charts
3. **قطعات** (Parts) — لیست قطعات مرتبط
4. **زیرسیستم** (SubSystems) — درخت زیرمجموعه
5. **سوابق تعمیرات** (History) — Timeline
6. **مدارک** (Documents) — گالری فایل‌ها
7. **PM ها** — برنامه‌های نگهداری این تجهیز
8. **AI Advisor** — مشاور هوشمند نت‌سلن

### ✅ Photo Gallery
- Grid layout
- Lightbox preview
- Upload multiple

### ✅ Documents
- File upload (drag & drop)
- Preview
- Download
- Type badges (Manual/Drawing/Certificate)

### ✅ Timeline
- Vertical timeline
- Event types: Failure, PM, Repair, Modification
- Filter by type

### ✅ QR Code Generation
- Auto-generate per asset
- Print-ready
- Contains code + link

### ✅ Print/PDF Export
- Print-friendly view
- Complete asset sheet

### ✅ AI Advisor Button
- Fixed button on asset page
- Chat with context
- Recommendations

## Files Added
- `src/components/features/assets/AssetWorkspace.tsx`
- `src/components/features/assets/tabs/IdentityTab.tsx`
- `src/components/features/assets/tabs/KpiTab.tsx`
- `src/components/features/assets/tabs/PartsTab.tsx`
- `src/components/features/assets/tabs/SubSystemsTab.tsx`
- `src/components/features/assets/tabs/HistoryTab.tsx`
- `src/components/features/assets/tabs/DocumentsTab.tsx`
- `src/components/features/assets/tabs/PMTab.tsx`
- `src/components/features/assets/tabs/AIAdvisorTab.tsx`
- `src/components/features/assets/AssetQRCode.tsx`
- `src/components/features/assets/PhotoGallery.tsx`

## Metrics
- **پیشرفت پروژه:** ۴۰٪ (۴ از ۱۰)
- **تب‌های Workspace:** ۸
- **زمان تخمینی فاز ۴:** ۴-۵ روز
