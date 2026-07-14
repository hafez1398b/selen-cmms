# 🔧 راهنمای نگهداری و رفع اشکال

## 📊 مانیتورینگ روزانه

### وضعیت سرویس‌ها (Docker)
```bash
docker compose ps
docker stats
df -h  # فضای دیسک
free -h  # RAM
```

### لاگ‌ها
```bash
# لاگ‌های ۱۰۰ خط آخر backend
docker logs baspar-backend --tail 100

# دنبال کردن زنده
docker logs -f baspar-backend

# فقط خطاها
docker logs baspar-backend 2>&1 | grep -i error
```

---

## 🔄 به‌روزرسانی سایت

### به‌روزرسانی Frontend
```bash
# روی سیستم لوکال build جدید بگیرید:
npm run build

# انتقال به سرور:
scp -r dist/* user@server:/opt/baspar-cmms/docker/dist/

# سرور کامنت‌های مرورگر را reload می‌کند خودکار (Service Worker)
# یا restart دستی:
docker compose restart frontend
```

### به‌روزرسانی Backend
```bash
# انتقال کد جدید
scp -r backend/* user@server:/opt/baspar-cmms/backend/

# rebuild و restart
cd /opt/baspar-cmms/docker
docker compose up -d --build backend
```

### به‌روزرسانی Schema DB
```bash
# اگر migration داشتید:
docker exec -i baspar-postgres psql -U baspar_user -d baspar_cmms < migrations/xxx.sql
```

---

## 💾 مدیریت پشتیبان

### بک‌آپ دستی
```bash
sudo bash /opt/baspar-cmms/scripts/backup.sh
```

### لیست بک‌آپ‌ها
```bash
ls -lh /var/backups/baspar-cmms/
```

### بازیابی
```bash
sudo bash /opt/baspar-cmms/scripts/restore.sh /var/backups/baspar-cmms/db-20260630.sql.gz
```

### انتقال بک‌آپ به سرور دیگر (Rsync)
```bash
# اضافه به cron برای انتقال روزانه:
rsync -avz /var/backups/baspar-cmms/ backup-server:/backups/baspar/
```

---

## 🔐 مدیریت کاربران

### ری‌ست رمز از طریق DB
```sql
-- تولید bcrypt hash روی سرور:
node -e "console.log(require('bcryptjs').hashSync('NewPassword', 10))"

-- بروزرسانی رمز:
UPDATE users SET password_hash = '$2a$10$...' WHERE email = 'admin@basparfoam.ir';
```

### اضافه کردن ادمین جدید
```sql
INSERT INTO users (name, email, password_hash, role)
VALUES ('نام ادمین', 'admin2@basparfoam.ir', '$2a$10$...', 'admin');
```

---

## 🚨 رفع خطاهای رایج

### ❌ "Connection refused" روی سایت
```bash
# 1. Nginx در حال اجراست؟
docker ps | grep frontend
sudo systemctl status nginx

# 2. Port 80 باز است؟
sudo ufw status
sudo netstat -tlnp | grep :80

# 3. لاگ nginx
docker logs baspar-frontend
```

### ❌ "Database connection failed"
```bash
# 1. PostgreSQL در حال اجراست؟
docker ps | grep postgres
docker exec baspar-postgres pg_isready

# 2. رمز درست است؟
docker exec -it baspar-postgres psql -U baspar_user -d baspar_cmms

# 3. حجم دیسک پر نیست؟
df -h
```

### ❌ سایت کند است
```bash
# 1. CPU و RAM
top
htop

# 2. تعداد کانکشن‌های DB
docker exec baspar-postgres psql -U baspar_user -d baspar_cmms -c "SELECT count(*) FROM pg_stat_activity;"

# 3. Slow queries
docker exec baspar-postgres psql -U baspar_user -d baspar_cmms -c "SELECT * FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10;"

# 4. اجرای VACUUM
docker exec baspar-postgres psql -U baspar_user -d baspar_cmms -c "VACUUM ANALYZE;"
```

### ❌ Service Worker cache قدیمی
- کاربران باید Ctrl+Shift+R بزنند
- یا در کنسول مرورگر: `resetApp()`
- برای همه: نسخه SW را در `public/sw.js` bump کنید

---

## 📈 بهینه‌سازی Performance

### PostgreSQL Tuning
```bash
# ویرایش /etc/postgresql/15/main/postgresql.conf:
shared_buffers = 256MB           # ۲۵٪ از RAM
effective_cache_size = 1GB       # ۷۵٪ از RAM
maintenance_work_mem = 64MB
work_mem = 4MB
max_connections = 100

sudo systemctl restart postgresql
```

### Nginx caching
اگر ترافیک بالا دارید، cache proxy فعال کنید (در `nginx.conf`)

---

## 🔒 نگهداری امنیت

### به‌روزرسانی‌های امنیتی
```bash
sudo apt update && sudo apt upgrade -y
docker compose pull  # پیدا کردن image های جدید
docker compose up -d
```

### بررسی تلاش‌های نفوذ
```bash
# لاگ‌های auth
sudo tail -f /var/log/auth.log

# fail2ban banned IPs
sudo fail2ban-client status sshd
```

### تغییر پورت SSH (توصیه‌شده)
```bash
sudo nano /etc/ssh/sshd_config
# Port 2222  ← به جای 22
sudo systemctl restart sshd
sudo ufw allow 2222/tcp
sudo ufw delete allow 22/tcp
```

---

## 📞 چک‌لیست ماهانه

- [ ] بررسی حجم بک‌آپ‌ها
- [ ] تست بازیابی از یک بک‌آپ روی سرور تست
- [ ] بررسی لاگ‌های خطا
- [ ] به‌روزرسانی سیستم‌عامل
- [ ] تعویض رمز ادمین‌ها
- [ ] بررسی گزارش fail2ban
- [ ] بررسی حجم دیتابیس (`SELECT pg_size_pretty(pg_database_size('baspar_cmms'));`)
