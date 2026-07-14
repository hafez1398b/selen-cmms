# 🐧 راهنمای نصب کامل روی Ubuntu Server

## پیش‌نیازها
- Ubuntu Server 22.04 LTS یا 24.04 LTS
- حداقل: 2 vCPU / 2GB RAM / 20GB SSD
- دسترسی root یا sudo
- اتصال اینترنت برای نصب اولیه

---

## 🚀 روش ۱: نصب اتوماتیک با Docker (توصیه‌شده)

### مرحله ۱: کپی فایل‌های deploy به سرور

```bash
# روی سیستم لوکال (Windows/Mac/Linux):
scp -r deploy/ user@SERVER_IP:/tmp/

# یا با git:
ssh user@SERVER_IP
git clone https://github.com/your-repo/baspar-cmms.git
cd baspar-cmms/deploy
```

### مرحله ۲: اجرای اسکریپت نصب

```bash
cd /tmp/deploy
sudo bash scripts/install.sh
```

این اسکریپت:
- ✅ Docker + Docker Compose نصب می‌کند
- ✅ Nginx نصب می‌کند
- ✅ Firewall تنظیم می‌کند (UFW)
- ✅ Fail2ban برای امنیت
- ✅ Auto-updates فعال می‌کند
- ✅ رمز DB و JWT Secret تصادفی می‌سازد

### مرحله ۳: قرار دادن فایل‌های frontend

فایل‌های `dist/` (که از `npm run build` تولید می‌شود) را در محل زیر قرار دهید:

```bash
# روی سیستم لوکال، build کنید:
cd /path/to/baspar-cmms-source
npm run build

# سپس dist/ را به سرور منتقل کنید:
scp -r dist/ user@SERVER_IP:/opt/baspar-cmms/docker/
```

### مرحله ۴: اجرای همه سرویس‌ها

```bash
cd /opt/baspar-cmms/docker
docker compose up -d
```

این دستور:
- 🐘 PostgreSQL راه‌اندازی می‌کند و schema را اجرا می‌کند
- 🚀 Backend API را اجرا می‌کند (پورت 3000)
- 🌐 Nginx برای frontend + proxy به backend (پورت 80)
- 🔧 Adminer برای مدیریت DB (پورت 8080، اختیاری)

### مرحله ۵: بررسی

```bash
# وضعیت سرویس‌ها:
docker compose ps

# لاگ‌ها:
docker compose logs -f backend

# تست:
curl http://localhost/api/health
```

سایت در `http://SERVER_IP` در دسترس است!

---

## 🔧 روش ۲: نصب دستی (بدون Docker)

### گام ۱: PostgreSQL

```bash
# نصب PostgreSQL 15
sudo apt install postgresql-15 -y

# ساخت دیتابیس و کاربر
sudo -u postgres psql <<EOF
CREATE DATABASE baspar_cmms WITH ENCODING 'UTF8';
CREATE USER baspar_user WITH PASSWORD 'YourStrongPassword';
GRANT ALL PRIVILEGES ON DATABASE baspar_cmms TO baspar_user;
EOF

# اجرای schema
sudo -u postgres psql -d baspar_cmms -f database/01-schema.sql
sudo -u postgres psql -d baspar_cmms -f database/02-seed-data.sql
sudo -u postgres psql -d baspar_cmms -f database/03-mock-history.sql
sudo -u postgres psql -d baspar_cmms -f database/04-indexes.sql
```

### گام ۲: Backend

```bash
# نصب Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install nodejs -y

# نصب پکیج‌ها
cd backend
npm install --production
cp .env.example .env
nano .env  # ← ویرایش DB_PASSWORD و JWT_SECRET

# ساخت systemd service
sudo tee /etc/systemd/system/baspar-backend.service <<EOF
[Unit]
Description=Baspar CMMS Backend
After=postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/baspar-cmms/backend
EnvironmentFile=/opt/baspar-cmms/backend/.env
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable --now baspar-backend
sudo systemctl status baspar-backend
```

### گام ۳: Nginx

```bash
sudo cp docker/nginx.conf /etc/nginx/sites-available/baspar
sudo ln -s /etc/nginx/sites-available/baspar /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# قرار دادن فایل‌های frontend
sudo cp -r dist/* /var/www/html/

sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔐 نصب SSL (HTTPS)

### با Let's Encrypt (رایگان)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d cmms.basparfoam.ir
```

### با CA داخلی شرکت

اگر شبکه داخلی است، از CA داخلی استفاده کنید و certificate روی سرور نصب کنید.

---

## 📊 دسترسی به دیتابیس

### با psql (Command Line)
```bash
docker exec -it baspar-postgres psql -U baspar_user -d baspar_cmms
```

### با Adminer (Web UI)
مرورگر → `http://SERVER_IP:8080`
- System: PostgreSQL
- Server: postgres
- Username: baspar_user
- Password: (از .env)
- Database: baspar_cmms

### با pgAdmin
```
Host: SERVER_IP
Port: 5432
Database: baspar_cmms
User: baspar_user
Password: (از .env)
```

---

## 💾 پشتیبان‌گیری خودکار

```bash
# اسکریپت backup را قابل اجرا کنید
sudo chmod +x /opt/baspar-cmms/scripts/backup.sh

# افزودن به crontab (روزانه ساعت ۲ بامداد)
sudo crontab -e
# افزودن این خط:
0 2 * * * /opt/baspar-cmms/scripts/backup.sh >> /var/log/baspar-cmms/backup.log 2>&1
```

بک‌آپ‌ها در `/var/backups/baspar-cmms/` ذخیره می‌شوند و ۳۰ روز نگه‌داری می‌شوند.

---

## 🔄 بازیابی

```bash
sudo bash /opt/baspar-cmms/scripts/restore.sh /var/backups/baspar-cmms/db-20260630.sql.gz
```

---

## 🐛 عیب‌یابی

### بررسی لاگ‌ها
```bash
# Backend
docker logs baspar-backend --tail 100

# PostgreSQL
docker logs baspar-postgres --tail 100

# Nginx
docker logs baspar-frontend --tail 100
```

### راه‌اندازی مجدد
```bash
cd /opt/baspar-cmms/docker
docker compose restart backend
docker compose restart frontend
```

### پاک کردن کامل و شروع مجدد
```bash
docker compose down -v  # ← حذف volumes = پاک شدن DB!
docker compose up -d
```

---

## 🔒 نکات امنیتی مهم

1. **رمز DB و JWT** را حتماً تغییر دهید (در `.env`)
2. **HTTPS** الزامی است (بدون آن Push Notification کار نمی‌کند)
3. **Firewall** فقط پورت‌های 22, 80, 443 باز باشد
4. **Backup** روزانه فعال باشد
5. رمز پیش‌فرض ادمین (`Baspar@1234`) را **بلافاصله** تغییر دهید
6. برای شبکه public از **Fail2ban** استفاده کنید (نصب شده)

---

## 📞 پشتیبانی

- ایمیل: support@basparfoam.ir
- تلفن: ۰۸۳-۳۴۲۸۰۰۰۰
