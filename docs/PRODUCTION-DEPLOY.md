# راهنمای Deploy روی سرور Production

## مقایسه ۳ گزینه اصلی

| ویژگی | Vercel (رایگان) | VPS ایرانی | سرور داخلی سلن |
|---|---|---|---|
| **هزینه ماهانه** | صفر | 200-500K ت | برق و نگهداری |
| **زمان راه‌اندازی** | ۱۰ دقیقه | ۱-۲ ساعت | ۱-۲ روز |
| **دیتابیس** | Vercel Postgres رایگان | نصب دستی | نصب دستی |
| **دامنه** | subdomain رایگان | نیاز به خرید | نیاز به خرید |
| **دسترسی داخلی سلن** | ❌ نیاز به VPN | ✅ | ✅✅ |
| **امنیت داده** | ابر خارجی | ابر داخلی | کامل داخلی |
| **پشتیبان‌گیری** | خودکار | نیاز به تنظیم | نیاز به تنظیم |
| **مناسب برای** | MVP و تست | ۱-۵۰ کاربر | Enterprise |

---

# 🥇 گزینه اول: Vercel (پیشنهاد اولیه - رایگان)

## مزایا
✅ کاملاً رایگان تا 100GB traffic ماهانه
✅ CDN سریع (5-20ms در ایران)
✅ Auto Deploy از GitHub
✅ HTTPS خودکار
✅ Preview URL برای هر Commit

## مراحل کامل (10 دقیقه)

### 1. ثبت‌نام
- GitHub: https://github.com/signup
- Vercel: https://vercel.com/signup (با GitHub وارد شو)

### 2. آپلود کد
- GitHub Desktop نصب کن
- ZIP رو Extract کن  
- Add Local Repository → پوشه پروژه
- Publish Repository

### 3. Deploy
- Vercel → New Project → Import GitHub Repo
- Deploy → ۲ دقیقه صبر
- لینک `selen-cmms.vercel.app` آماده!

### 4. دیتابیس
- Vercel → Storage → Create Postgres
- خودکار به پروژه وصل می‌شه

**راهنمای کامل قدم به قدم:** `docs/VERCEL-STEP-BY-STEP.md`

---

# 🥈 گزینه دوم: VPS ایرانی

## چرا VPS ایرانی؟
- سرعت بالا برای کاربران داخل ایران
- تحریم‌شکن نیازی نیست
- پشتیبانی فارسی

## هاست‌های ایرانی پیشنهادی

| شرکت | لینک | مشخصات | قیمت |
|---|---|---|---|
| **ایران هاست** | irhost.com | 2GB RAM, 40GB SSD | 250K ت/ماه |
| **پارس‌پک** | parspack.com | 4GB RAM, 80GB SSD | 450K ت/ماه |
| **آسیاتک** | asiatech.ir | 4GB RAM, 100GB SSD | 500K ت/ماه |
| **سرور دات آی آر** | server.ir | 2GB RAM, 60GB SSD | 300K ت/ماه |

**حداقل مشخصات:** 2GB RAM، 40GB SSD، Ubuntu 22.04

## مراحل کامل (1-2 ساعت)

### مرحله 1: خرید VPS
1. برو به `parspack.com` (یا هر سرویس‌دهنده دیگر)
2. سرور مجازی → Linux → Ubuntu 22.04
3. پرداخت و دریافت اطلاعات ورود:
   - IP سرور: `185.xxx.xxx.xxx`
   - Username: `root`
   - Password: `xxxxxxxxxx`

### مرحله 2: اتصال به سرور

**ویندوز:** برنامه PuTTY نصب کن → آدرس IP و Port 22

**Mac/Linux:** ترمینال باز کن:
```bash
ssh root@185.xxx.xxx.xxx
```

### مرحله 3: نصب پیش‌نیازها

```bash
# آپدیت سیستم
apt update && apt upgrade -y

# نصب Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# نصب PostgreSQL 15
apt install -y postgresql postgresql-contrib

# نصب Nginx (وب سرور)
apt install -y nginx

# نصب PM2 (مدیریت پروسه)
npm install -g pm2

# نصب Git
apt install -y git
```

### مرحله 4: راه‌اندازی PostgreSQL

```bash
# ورود به postgres
sudo -u postgres psql

# ایجاد دیتابیس و کاربر
CREATE DATABASE selen_cmms;
CREATE USER selen WITH ENCRYPTED PASSWORD 'YourStrongPassword123!';
GRANT ALL PRIVILEGES ON DATABASE selen_cmms TO selen;
\q
```

### مرحله 5: آپلود پروژه

```bash
# رفتن به مسیر
cd /var/www

# Clone از GitHub
git clone https://github.com/YOUR_USERNAME/selen-cmms.git
cd selen-cmms

# نصب dependencies
npm install

# ایجاد فایل .env
nano .env
```

محتوای `.env`:
```
DATABASE_URL=postgresql://selen:YourStrongPassword123!@localhost:5432/selen_cmms
NODE_ENV=production
PORT=3000
```

### مرحله 6: Build و Start

```bash
# اعمال schema دیتابیس
npx drizzle-kit push

# Build production
npm run build

# اجرا با PM2
pm2 start npm --name "selen-cmms" -- start
pm2 save
pm2 startup
```

### مرحله 7: تنظیم Nginx

```bash
nano /etc/nginx/sites-available/selen-cmms
```

محتوا:
```nginx
server {
    listen 80;
    server_name cmms.selen.ir;  # دامنه خود را جایگزین کن

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    client_max_body_size 50M;
}
```

```bash
# فعال‌سازی
ln -s /etc/nginx/sites-available/selen-cmms /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### مرحله 8: HTTPS رایگان (Let's Encrypt)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d cmms.selen.ir
```

### مرحله 9: تنظیم دامنه

اگر دامنه دارید:
- در پنل مدیریت دامنه (مثل ایران‌سرور یا پارس‌پک)
- رکورد A بسازید:
  - Name: `cmms`
  - Value: IP سرور
  - TTL: 3600

**تمام! سایت شما روی `https://cmms.selen.ir` در دسترس است**

### آپدیت‌های بعدی

```bash
cd /var/www/selen-cmms
git pull
npm install
npm run build
pm2 restart selen-cmms
```

---

# 🥉 گزینه سوم: سرور داخلی سلن (بهترین برای Enterprise)

## چرا سرور داخلی؟
- ✅ داده‌ها کامل داخل شرکت
- ✅ سرعت بسیار بالا برای کارکنان
- ✅ بدون هزینه ماهانه
- ✅ کنترل کامل

## پیش‌نیازها
- کامپیوتر/سرور با حداقل مشخصات:
  - CPU: 4 هسته
  - RAM: 8GB
  - Storage: 250GB SSD
  - OS: Ubuntu Server 22.04
- دسترسی به شبکه داخلی
- IT سلن برای نصب

## مراحل کلی
1. نصب Ubuntu Server
2. تخصیص IP ثابت داخلی (مثل `192.168.1.100`)
3. مراحل مشابه گزینه ۲ (VPS)
4. تنظیم DNS داخلی یا استفاده از IP
5. Firewall رو تنظیم کن که فقط شبکه داخلی دسترسی داشته باشه

## دسترسی
کاربران داخل کارخانه: `http://192.168.1.100`

برای دسترسی از بیرون:
- VPN شرکتی راه‌اندازی کن
- یا Port Forward با احتیاط

---

# 🔄 چطور تغییرات جدید اضافه کنیم؟

## در Vercel (خودکار)
1. ZIP جدید از Arena بگیر
2. Extract کن روی پوشه GitHub
3. GitHub Desktop → Commit → Push
4. Vercel **خودکار** deploy می‌کنه ✅

## در VPS / سرور داخلی

### روش 1: از GitHub (پیشنهادی)
```bash
ssh root@your-server
cd /var/www/selen-cmms
git pull
npm install
npm run build
pm2 restart selen-cmms
```

### روش 2: FTP دستی
1. با FileZilla به سرور وصل شو
2. فایل‌های جدید رو کپی کن
3. در SSH: `npm run build && pm2 restart selen-cmms`

---

# 🎯 پیشنهاد من

**مرحله ۱ (فعلاً):**
Vercel رایگان → برای تست، نمایش به مدیر، و بازخورد سریع

**مرحله ۲ (بعد از تست کامل):**
سرور داخلی سلن → برای استفاده واقعی در شرکت

## هزینه‌های تخمینی راه‌اندازی حرفه‌ای

| مورد | هزینه یک‌باره | ماهانه |
|---|---|---|
| VPS ایرانی (2GB) | - | 250-500K ت |
| دامنه `.ir` | 60K ت/سال | ~5K ت |
| دامنه `.com` | 500K ت/سال | ~40K ت |
| SSL (Let's Encrypt) | رایگان | رایگان |
| نصب و راه‌اندازی | 1-3M ت (یکبار) | - |
| **مجموع** | ~1.5M ت | 300-500K ت |

---

# ⚠️ نکات مهم

1. **Backup روزانه** بسازید و در جای دیگر نگهداری کنید
2. **Firewall** فعال کنید (UFW در Ubuntu):
   ```bash
   ufw allow 22
   ufw allow 80
   ufw allow 443
   ufw enable
   ```
3. **رمز عبور قوی** برای PostgreSQL و SSH
4. **آپدیت‌های امنیتی**:
   ```bash
   apt update && apt upgrade -y
   ```
5. **مانیتورینگ**: از سرویس‌هایی مثل UptimeRobot استفاده کنید

---

# 📞 پشتیبانی

اگر در هر مرحله گیر کردید، به من در Arena بگویید:
- کدام گزینه رو انتخاب کردید؟
- در کدام مرحله هستید؟
- چه خطایی می‌بینید؟ (screenshot)

من قدم به قدم راهنمایی می‌کنم 💪
