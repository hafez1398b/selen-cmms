# Phase 4 Changelog — Maintenance Management

## نسخه: v0.5.0-phase-4

## هدف
ماژول کامل مدیریت نگهداری و تعمیرات شامل:
- PM (Preventive Maintenance) - نگهداری پیشگیرانه
- CM (Corrective Maintenance) - نگهداری اصلاحی
- PdM (Predictive Maintenance) - نگهداری پیش‌بینانه
- Checklist Builder
- Lubrication & Inspection Routes
- Calendar & Timeline View

## Deliverables

### ✅ Maintenance Types
- **PM دوره‌ای** — بر اساس زمان (روز/هفته/ماه)
- **PM ساعتی** — بر اساس ساعت کارکرد
- **PM شرایطی** — بر اساس وضعیت (وایبرشن، دما)
- **CM** — اصلاحی (پس از خرابی)
- **PdM** — پیش‌بینانه با AI

### ✅ Views
- **Dashboard PM** — نمای کلی وضعیت
- **Calendar View** — ماهیانه/هفتگی
- **Timeline View** — Gantt-like
- **List View** — جدول کامل
- **Kanban View** — به تفکیک وضعیت

### ✅ Checklist Builder
- ایجاد چک‌لیست با drag & drop
- انواع آیتم: چک‌باکس، عدد، متن، عکس
- الزامی/اختیاری
- استانداردهای پیش‌فرض (ISO/TPM/RCM)
- کپی از تمپلیت

### ✅ Lubrication Routes
- مسیرهای روانکاری
- انواع روانکار
- زمان‌بندی
- نقاط روانکاری هر تجهیز

### ✅ Inspection Rounds
- گشت‌های بازرسی
- مسیر با ترتیب
- نقاط بازرسی
- زمان تخمینی

### ✅ Auto Work Order Generation
- تولید خودکار WO از PM
- تنظیم قوانین
- تخصیص خودکار به تکنسین

### ✅ Trigger Conditions
- زمانی (Fixed schedule)
- کارکردی (Meter reading)
- شرایطی (Threshold-based)
- ترکیبی (Multiple triggers)

## Files Added
- `src/lib/maintenance-data.ts`
- `src/hooks/useMaintenanceCalendar.ts`
- `src/components/features/maintenance/MaintenanceDashboard.tsx`
- `src/components/features/maintenance/PMList.tsx`
- `src/components/features/maintenance/PMCalendar.tsx`
- `src/components/features/maintenance/PMTimeline.tsx`
- `src/components/features/maintenance/PMKanban.tsx`
- `src/components/features/maintenance/ChecklistBuilder.tsx`
- `src/components/features/maintenance/LubricationRoutes.tsx`
- `src/components/features/maintenance/InspectionRounds.tsx`
- `src/components/features/maintenance/PMExecutionModal.tsx`
- `src/components/features/maintenance/PMFormAdvanced.tsx`

## Metrics
- **پیشرفت پروژه:** ۵۰٪ (۵ از ۱۰)
- **PM های نمونه:** ۲۵+
- **نماها:** ۵ (Dashboard/List/Calendar/Timeline/Kanban)
- **زمان تخمینی فاز ۵:** ۴ روز
