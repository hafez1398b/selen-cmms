# سامانه هوشمند نت‌سلن — Selen CMMS/EAM

سامانه جامع مدیریت نگهداری و تعمیرات (CMMS/EAM) با هوش مصنوعی برای گروه صنعتی سلن (بسپار فوم غرب)

## ⚡ ویژگی‌های کلیدی

- 🌳 **درخت تجهیزات نامحدود** — از شرکت تا زیرقطعات
- 🔧 **مدیریت PM/CM/PdM** با استاندارد ISO 55000, TPM, RCM
- 📋 **دستور کار** با Workflow کامل
- 👥 **مدیریت پرسنل** با Skill Matrix
- 📦 **انبار هوشمند** با AI
- 🤖 **مشاور AI** — پیش‌بینی، RCA، FMEA
- 📊 **گزارش Excel واقعی**
- 📱 **کاملاً Responsive** — Desktop, Tablet, Mobile
- 🎨 **دو تم**: تیره (مشکی/طلایی) و روشن (طوسی/قرمز)

## 🚀 راه‌اندازی سریع

### پیش‌نیازها
- Node.js 20+
- PostgreSQL 15+ (اختیاری، برای Production)

### مراحل
```bash
# 1. نصب پکیج‌ها
npm install

# 2. کپی متغیرهای محیطی
cp .env.example .env

# 3. اجرای development
npm run dev

# سایت روی http://localhost:3000 در دسترس است
```

### Deploy روی Vercel
راهنمای کامل: [docs/VERCEL-STEP-BY-STEP.md](docs/VERCEL-STEP-BY-STEP.md)

## 🔐 ورود آزمایشی

| نام کاربری | رمز | نقش |
|---|---|---|
| `admin` | `admin` | مدیر ارشد |
| `supervisor` | `1234` | سرپرست |
| `expert` | `1234` | کارشناس |
| `technician` | `1234` | تکنسین |

## 📚 مستندات

- [Architecture](docs/01-ARCHITECTURE.md)
- [Database Design](docs/02-DATABASE-DESIGN.md)
- [Development Roadmap](docs/04-DEVELOPMENT-ROADMAP.md)
- [Vercel Deployment](docs/VERCEL-STEP-BY-STEP.md)

## 🛠 استک فنی

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5.9
- **UI:** Tailwind CSS 4 + Custom Design System
- **Charts:** Recharts
- **ORM:** Drizzle
- **Excel:** SheetJS
- **Font:** Vazirmatn

## 📄 لایسنس

اختصاصی گروه صنعتی سلن (بسپار فوم غرب)

---

نسخه: **1.0.0** — تاریخ: **۱۴۰۳/۱۱**
