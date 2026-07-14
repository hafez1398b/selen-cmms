# 📦 پکیج استقرار سامانه CMMS بسپارفوم غرب

## 🎯 محتویات این پوشه

```
deploy/
├── README.md                    ← این فایل
├── database/
│   ├── 01-schema.sql           ← ساختار کامل دیتابیس (30+ جدول)
│   ├── 02-seed-data.sql        ← داده‌های اولیه (کاربران، تجهیزات، PM، ...)
│   ├── 03-mock-history.sql     ← سوابق آزمایشی از 1405/01/01
│   └── 04-indexes.sql          ← ایندکس‌ها برای بهبود سرعت
├── backend/                     ← API سرور (Node.js + Express)
│   ├── package.json
│   ├── server.js
│   ├── routes/
│   └── .env.example
├── docker/
│   ├── docker-compose.yml       ← اجرای همه چیز با یک دستور
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx.conf
├── scripts/
│   ├── install.sh               ← اسکریپت نصب اتوماتیک Ubuntu
│   ├── backup.sh                ← بک‌آپ روزانه دیتابیس
│   └── restore.sh               ← بازیابی
└── docs/
    ├── INSTALL-UBUNTU.md        ← راهنمای نصب کامل روی Ubuntu
    ├── INSTALL-WINDOWS.md       ← راهنمای نصب روی Windows Server
    └── MAINTENANCE.md           ← نگهداری و رفع اشکال
```

## 🚀 نصب سریع (Ubuntu 22.04)

```bash
# 1. اسکریپت نصب اتوماتیک را اجرا کنید (به‌عنوان root):
sudo bash scripts/install.sh

# 2. یا با Docker:
cd docker/
docker compose up -d

# 3. سایت روی http://IP-سرور در دسترس است!
```

## 📋 دستور کامل ساخت زیپ

اگر می‌خواهید همه چیز را زیپ کنید:

```bash
cd deploy/
zip -r baspar-cmms-deploy.zip . -x "node_modules/*" ".git/*"
```

فایل نهایی `baspar-cmms-deploy.zip` را می‌توانید به سرور منتقل کنید.

---

**نسخه:** 1.0.0
**تاریخ:** 1405/04/09
**پشتیبانی:** support@basparfoam.ir
