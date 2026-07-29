# Phase 2 Changelog — Asset Management

## نسخه: v0.3.0-phase-2

## هدف
ساخت ماژول کامل مدیریت درخت تجهیزات مطابق ساختار واقعی گروه صنعتی سلن (بسپار فوم غرب) شامل ۶ خط تولید بسپار.

## Deliverables

### ✅ ساختار درختی نامحدود
مطابق درخواست کارفرما:
```
شرکت (Selen Industrial Group)
  └─ کارخانه (بسپار فوم غرب)
      ├─ بسپار 1 (فوم)
      ├─ بسپار 2 (مموری)
      ├─ بسپار 3 (اسفنج)
      ├─ بسپار 4
      ├─ بسپار 5
      └─ بسپار 6
          └─ موقعیت
              └─ دسته تجهیز
                  └─ تجهیز
                      └─ زیرسیستم
                          └─ قطعات
                              └─ زیرقطعات
```

### ✅ Tree Component
- Recursive rendering
- Expand/Collapse با انیمیشن
- آیکون مخصوص هر نوع (Company/Plant/Line/Location/...)
- Level indicator (رنگ مختلف در هر عمق)
- Health Score badge روی هر گره

### ✅ Drag & Drop
- HTML5 Drag API
- امکان انتقال زیرشاخه بین والدها
- محدودیت‌های validation (نمی‌توان والد را داخل فرزند برد)
- Visual feedback هنگام درگ
- Toast notification در موفقیت

### ✅ Search & Filter
- Full-text search در نام و کد
- Highlight نتایج
- فیلتر بر اساس: نوع، وضعیت، بحرانیت، سلامت
- فیلترهای ترکیبی
- Clear all filters
- Result count

### ✅ Breadcrumb
- مسیر کامل از ریشه تا گره
- کلیک روی هر بخش برای jump
- Truncate در موبایل

### ✅ Zoom Control
- Zoom In / Out / Reset
- ۵ سطح: 75%, 90%, 100%, 115%, 130%
- کیبورد شورتکات (Ctrl + +/-)

### ✅ Mini Map
- نمای کلی درخت در گوشه
- نشانگر ناحیه فعلی
- کلیک برای jump سریع

### ✅ CRUD کامل
- Add Node (به هر والدی)
- Edit Node (inline + modal)
- Delete با confirmation
- Duplicate
- Bulk Delete
- Bulk Move

### ✅ Toolbar
- Add Root
- Expand All / Collapse All
- Export (Excel/JSON)
- Import (Excel)
- View Mode: Tree / List / Cards

### ✅ Asset Actions
- View Details
- Edit
- Move
- Duplicate
- Add Child
- Delete
- Copy Link
- Print QR Code

## Files Added
- `src/lib/assets-data.ts` (expanded data matching Selen structure)
- `src/components/features/assets/AssetTree.tsx`
- `src/components/features/assets/AssetNode.tsx`
- `src/components/features/assets/AssetBreadcrumb.tsx`
- `src/components/features/assets/AssetToolbar.tsx`
- `src/components/features/assets/AssetFilterPanel.tsx`
- `src/components/features/assets/AssetMiniMap.tsx`
- `src/components/features/assets/AssetActions.tsx`
- `src/components/features/assets/AssetBulkBar.tsx`
- `src/hooks/useAssetTree.ts`

## Metrics
- **پیشرفت پروژه:** ۳۰٪ (۳ از ۱۰)
- **گره‌های نمونه:** ۶۰+ (کامل سلن)
- **زمان تخمینی فاز ۳:** ۳-۴ روز
