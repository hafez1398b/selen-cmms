# Product Backlog

## Epics & User Stories (MoSCoW)

### 🔴 Must Have (MVP)

#### Epic 1: Asset Management
- US-001: به عنوان مدیر فنی، می‌خواهم ساختار درختی نامحدود تجهیزات ایجاد کنم
- US-002: می‌خواهم تجهیزات را با drag & drop جابجا کنم
- US-003: می‌خواهم شناسنامه کامل تجهیز را ببینم و ویرایش کنم
- US-004: می‌خواهم مدارک و تصاویر تجهیز را پیوست کنم

#### Epic 2: Maintenance
- US-010: می‌خواهم برنامه PM بر اساس زمان تعریف کنم
- US-011: می‌خواهم PM بر اساس ساعت کارکرد تعریف کنم
- US-012: می‌خواهم چک‌لیست PM بسازم
- US-013: می‌خواهم سررسید PM را ببینم و اعلان بگیرم

#### Epic 3: Work Order
- US-020: می‌خواهم دستور کار ایجاد کنم
- US-021: می‌خواهم دستور کار را تایید یا رد کنم
- US-022: می‌خواهم دستور کار را به تکنسین تخصیص دهم
- US-023: می‌خواهم پیشرفت را ثبت کنم
- US-024: می‌خواهم دستور کار را ببندم

#### Epic 4: Failure Management
- US-030: می‌خواهم خرابی گزارش کنم
- US-031: می‌خواهم علت ریشه‌ای تحلیل کنم (RCA)
- US-032: می‌خواهم زمان توقف را محاسبه کنم

#### Epic 5: Inventory
- US-040: می‌خواهم قطعه یدکی ثبت کنم
- US-041: می‌خواهم موجودی را ببینم
- US-042: می‌خواهم هشدار کمبود بگیرم
- US-043: می‌خواهم مصرف قطعه ثبت کنم

#### Epic 6: Dashboard & KPI
- US-050: می‌خواهم داشبورد مدیریتی ببینم
- US-051: می‌خواهم MTBF/MTTR/OEE را ببینم
- US-052: می‌خواهم روند خرابی‌ها را ببینم

### 🟡 Should Have (Phase 2 Priority)

#### Epic 7: AI Import
- US-060: می‌خواهم فایل Excel تجهیزات را وارد کنم و AI ستون‌ها را تشخیص دهد
- US-061: می‌خواهم PDF شناسنامه را وارد کنم و OCR شود
- US-062: می‌خواهم تصویر نامپلیت را وارد کنم

#### Epic 8: AI Assistant
- US-070: می‌خواهم از مشاور نت‌سلن سوال بپرسم
- US-071: می‌خواهم AI برنامه PM پیشنهاد دهد
- US-072: می‌خواهم AI RCA کمک کند

#### Epic 9: Personnel
- US-080: می‌خواهم پرسنل و مهارت‌ها را مدیریت کنم
- US-081: می‌خواهم شیفت‌بندی کنم

#### Epic 10: Reports
- US-090: می‌خواهم گزارش Excel/PDF خروجی بگیرم
- US-091: می‌خواهم گزارش زمان‌بندی شده ایمیل شود

### 🟢 Could Have (Enhancement)

- US-100: QR Code تجهیزات
- US-101: Mobile PWA
- US-102: Notification Push
- US-103: Multi-language (Persian/English)
- US-104: Dark/Light Theme
- US-105: Custom Dashboard Builder

### ⚪ Won't Have (این نسخه)

- ERP Integration
- IoT Sensors Live Feed
- AR/VR Guides
- Native Mobile App

---

## Priority Matrix (Value vs Effort)

```
        High Value
              │
    P1 QUICK  │  P2 STRATEGIC
    WINS      │  INVESTMENTS
    ──────────┼──────────
    P3 FILL-  │  P4 THANKLESS
    INS       │  TASKS
              │
        Low Value
    Low Effort ← → High Effort
```

### P1 (Quick Wins)
- Dashboard KPI
- Search & Filter
- Basic Reports

### P2 (Strategic)
- AI Import System
- Predictive Maintenance
- RCA/FMEA

### P3 (Fill-Ins)
- QR Codes
- Dark/Light Theme

### P4 (Consider Later)
- SSO
- Multi-tenant

---

## Success Metrics per Epic

| Epic | Success Metric |
|---|---|
| Asset Mgmt | 100% تجهیزات فعال ثبت شود |
| Maintenance | 95% تطابق PM |
| Work Order | زمان چرخه < 3 روز |
| Failure | RCA 100% خرابی‌های بحرانی |
| Inventory | 0 کمبود اضطراری |
| Dashboard | 100% استفاده روزانه مدیران |
| AI | 50% کاهش زمان ورود اطلاعات |
