# راهنمای Deploy روی Vercel (رایگان و دائمی)

## چرا Vercel؟
✅ **رایگان** (تا ۱۰۰GB bandwidth ماهانه)
✅ **لینک دائمی** (`your-project.vercel.app`)
✅ **HTTPS خودکار**
✅ **Auto Deploy** از Git
✅ **سریع** (CDN جهانی)
✅ **پشتیبانی کامل از Next.js**

## روش ۱: Deploy سریع (۵ دقیقه)

### پیش‌نیازها
1. حساب GitHub (رایگان)
2. حساب Vercel (رایگان - با GitHub وارد شوید)

### مراحل:

#### گام ۱: کد را به GitHub منتقل کنید
```bash
# در پوشه پروژه
git init
git add .
git commit -m "Initial commit"

# در GitHub یک repository جدید بسازید (private یا public)
git remote add origin https://github.com/YOUR_USERNAME/selen-cmms.git
git branch -M main
git push -u origin main
```

#### گام ۲: به Vercel وصل کنید
1. به [vercel.com](https://vercel.com) بروید
2. **Sign Up with GitHub** کلیک کنید
3. **New Project** بزنید
4. Repository خود را انتخاب کنید
5. **Deploy** بزنید

#### گام ۳: تنظیم دیتابیس
Vercel به‌طور خودکار PostgreSQL رایگان می‌دهد:
1. در پروژه Vercel → **Storage** → **Create Database**
2. **Postgres** را انتخاب کنید
3. متغیر `DATABASE_URL` به‌طور خودکار اضافه می‌شود

**تمام!** سایت شما در `https://selen-cmms.vercel.app` دائمی خواهد بود.

---

## روش ۲: Deploy با CLI

```bash
# نصب Vercel CLI
npm i -g vercel

# در پوشه پروژه
vercel login
vercel

# پرسش‌ها را جواب دهید:
# ? Set up and deploy? Y
# ? Which scope? [account]
# ? Link to existing? N
# ? What's your project's name? selen-cmms
# ? In which directory? ./
```

پس از چند ثانیه لینک دائمی دریافت می‌کنید.

---

## روش ۳: سرور داخلی شرکت سلن

اگر می‌خواهید روی سرور خودتان اجرا کنید:

### پیش‌نیازها:
- Ubuntu 22.04 یا Windows Server
- Node.js 20+
- PostgreSQL 15+
- Nginx (اختیاری)

### مراحل:
```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/selen-cmms.git
cd selen-cmms

# 2. Install
npm install

# 3. .env file
cp .env.example .env
# ویرایش DATABASE_URL

# 4. Push schema
npx drizzle-kit push

# 5. Build
npm run build

# 6. Start (production)
npm start

# 7. برای اجرای دائمی
npm i -g pm2
pm2 start npm --name "selen-cmms" -- start
pm2 save
pm2 startup
```

**دسترسی:** `http://your-server-ip:3000`

---

## مقایسه پلتفرم‌ها

| پلتفرم | هزینه | راه‌اندازی | دیتابیس | مناسب برای |
|---|---|---|---|---|
| **Vercel** | رایگان | 5 دقیقه | Postgres رایگان | MVP و تست |
| **Railway** | $5/ماه | 10 دقیقه | شامل | Production کوچک |
| **DigitalOcean** | $12/ماه | 30 دقیقه | جدا | Production متوسط |
| **سرور داخلی** | متغیر | ۱-۲ روز | جدا | Enterprise |

---

## توصیه ما برای گروه صنعتی سلن

**مرحله ۱ (فعلی):** Vercel رایگان - برای تست و بازخورد
**مرحله ۲ (Production):** سرور داخلی شرکت با PM2 - برای امنیت داده‌ها

## پشتیبانی

پس از deploy، اگر مشکلی داشتید:
- بررسی logs در Vercel Dashboard
- بررسی `.env` variables
- تست `/api/health` endpoint
