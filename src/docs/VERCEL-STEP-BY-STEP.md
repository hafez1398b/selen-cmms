# راهنمای گام به گام Deploy روی Vercel

## هدف نهایی
لینک دائمی مثل: `https://selen-cmms.vercel.app`

## زمان مورد نیاز
حدود **۱۵-۳۰ دقیقه**

## پیش‌نیازها
1. کامپیوتر با اینترنت
2. یک ایمیل معتبر
3. مرورگر (Chrome, Firefox, ...)

---

# مرحله ۱: ساخت حساب GitHub

## چرا GitHub؟
کد پروژه باید در یک repository آنلاین باشد تا Vercel بتواند آن را deploy کند.

## گام ۱.۱: به سایت GitHub بروید
- آدرس: **https://github.com/signup**

## گام ۱.۲: ثبت‌نام کنید
- ایمیل خود را وارد کنید
- یک رمز عبور قوی انتخاب کنید (حداقل ۱۵ کاراکتر یا ۸ کاراکتر با عدد و علامت)
- یک username انتخاب کنید (مثلاً `selen-cmms` یا `your-name`)
- کد تأیید ایمیل را وارد کنید

## گام ۱.۳: پلن Free را انتخاب کنید
- گزینه **Free** را بزنید (رایگان است)
- می‌توانید سوالات personalization را رد کنید

**✅ تمام! حالا حساب GitHub دارید.**

---

# مرحله ۲: دانلود کد پروژه

## گام ۲.۱: دانلود کد فعلی
از پلتفرم Arena کد پروژه را به‌صورت ZIP دانلود کنید:
- روی دکمه دانلود یا Export در Arena کلیک کنید
- فایل `selen-cmms.zip` را ذخیره کنید

## گام ۲.۲: Extract کنید
- روی فایل ZIP راست کلیک کنید
- Extract Here بزنید
- پوشه‌ای مثل `selen-cmms` ایجاد می‌شود

---

# مرحله ۳: آپلود به GitHub

## روش الف: از طریق مرورگر (ساده‌ترین)

### گام ۳.۱: Repository جدید بسازید
1. در سایت GitHub، روی **+** بالای صفحه کلیک کنید
2. **New repository** را انتخاب کنید

### گام ۳.۲: تنظیمات Repository
- **Repository name:** `selen-cmms`
- **Description:** `سامانه هوشمند نگهداری و تعمیرات - گروه صنعتی سلن`
- **Visibility:** 
  - **Private** (خصوصی - توصیه می‌شود)
  - یا **Public** (عمومی)
- گزینه **Add a README file** را **تیک نزنید**
- روی **Create repository** کلیک کنید

### گام ۳.۳: آپلود فایل‌ها
1. در صفحه repository، روی **uploading an existing file** کلیک کنید
2. تمام فایل‌های پوشه پروژه را انتخاب کنید (Ctrl+A) و بکشید داخل صفحه
3. صبر کنید تا آپلود شود (چند دقیقه)
4. در پایین صفحه پیام Commit بنویسید: `Initial commit`
5. روی **Commit changes** کلیک کنید

**⚠️ نکته:** پوشه `node_modules` را آپلود نکنید (بزرگ است). اگر Git نصب دارید از روش ب استفاده کنید.

---

## روش ب: از طریق Git (حرفه‌ای)

### گام ۳.۱: نصب Git
- ویندوز: https://git-scm.com/download/win
- Mac: `brew install git`
- Linux: `sudo apt install git`

### گام ۳.۲: دستورات Terminal/CMD
```bash
# وارد پوشه پروژه شوید
cd selen-cmms

# init کنید
git init

# اضافه کردن فایل‌ها
git add .

# commit
git commit -m "Initial commit"

# اتصال به GitHub (آدرس repository خود را جایگزین کنید)
git remote add origin https://github.com/YOUR_USERNAME/selen-cmms.git

# push
git branch -M main
git push -u origin main
```

اگر از شما username و password خواست:
- **Username:** GitHub username شما
- **Password:** باید Personal Access Token بسازید:
  1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
  2. Generate new token (classic)
  3. تیک `repo` را بزنید
  4. Generate token
  5. Token را کپی کنید و به‌جای password استفاده کنید

---

# مرحله ۴: ساخت حساب Vercel

## گام ۴.۱: به Vercel بروید
- آدرس: **https://vercel.com/signup**

## گام ۴.۲: ورود با GitHub
- روی **Continue with GitHub** کلیک کنید
- درخواست دسترسی به GitHub را قبول کنید
- تأیید ایمیل را بزنید

## گام ۴.۳: انتخاب پلن
- **Hobby** را انتخاب کنید (رایگان)
- پرسش‌های Onboarding را جواب دهید یا رد کنید

**✅ حساب Vercel آماده است!**

---

# مرحله ۵: Deploy پروژه

## گام ۵.۱: New Project
- در داشبورد Vercel، روی **Add New...** → **Project** کلیک کنید

## گام ۵.۲: Import Repository
- در بخش **Import Git Repository** repository `selen-cmms` را پیدا کنید
- روی **Import** کلیک کنید
- اگر repository نمایش داده نشد:
  - روی **Adjust GitHub App Permissions** کلیک کنید
  - دسترسی به repository را بدهید

## گام ۵.۳: تنظیمات پروژه
- **Project Name:** `selen-cmms` (یا هرچه دوست دارید)
- **Framework Preset:** `Next.js` (خودکار شناسایی می‌شود)
- **Root Directory:** `./` (پیش‌فرض)
- بقیه تنظیمات را دست نزنید

## گام ۵.۴: تنظیم متغیرهای محیطی (Environment Variables)
اینجا مهم است! نیاز به دیتابیس دارید.

### گزینه ۱: بدون دیتابیس (فعلاً)
هیچ چیز اضافه نکنید. سایت با mock data کار می‌کند.

### گزینه ۲: با دیتابیس رایگان Vercel
1. **DATABASE_URL** را اضافه کنید (فعلاً موقتی):
   - Key: `DATABASE_URL`
   - Value: `postgresql://user:pass@localhost:5432/db` (بعداً درست می‌کنیم)

## گام ۵.۵: Deploy!
- روی دکمه **Deploy** کلیک کنید
- **۲-۳ دقیقه** صبر کنید
- Vercel در حال build کردن پروژه است...

**🎉 وقتی سبز شد یعنی موفق!**

## گام ۵.۶: مشاهده سایت
- Vercel یک لینک به شما می‌دهد: `https://selen-cmms-xxx.vercel.app`
- روی **Visit** کلیک کنید
- تبریک! سایت شما آنلاین است 🚀

---

# مرحله ۶: اتصال دیتابیس (اختیاری)

اگر می‌خواهید دیتای واقعی ذخیره شود:

## گام ۶.۱: ساخت دیتابیس Postgres
1. در Vercel Dashboard، به پروژه بروید
2. تب **Storage** را انتخاب کنید
3. **Create Database** → **Postgres**
4. یک نام انتخاب کنید (مثلاً `selen-db`)
5. Region: `Frankfurt (fra1)` (نزدیک‌تر به ایران)
6. **Create** بزنید

## گام ۶.۲: اتصال به پروژه
- Vercel به‌طور خودکار متغیر `DATABASE_URL` را اضافه می‌کند
- روی **Connect Project** کلیک کنید
- پروژه `selen-cmms` را انتخاب کنید

## گام ۶.۳: Redeploy
- به تب **Deployments** بروید
- روی سه نقطه آخرین deployment → **Redeploy**

**دیتابیس متصل شد!**

---

# مرحله ۷: تنظیم دامنه (اختیاری)

## گام ۷.۱: خرید دامنه (اگر دارید رد کنید)
- از سایت‌های ایرانی: [ایران هاست](https://irhost.com)، [پارس‌پک](https://parspack.com)
- از سایت‌های خارجی: [Namecheap](https://namecheap.com)، [Cloudflare](https://cloudflare.com)

## گام ۷.۲: افزودن دامنه در Vercel
1. در پروژه Vercel → **Settings** → **Domains**
2. دامنه خود را وارد کنید: `cmms.selen.ir`
3. **Add** بزنید

## گام ۷.۳: تنظیم DNS در ثبت‌کننده دامنه
Vercel رکوردهایی به شما نمایش می‌دهد. آنها را در پنل مدیریت دامنه خود اضافه کنید:
- Type: `CNAME`
- Name: `cmms`
- Value: `cname.vercel-dns.com`

بعد از ۱-۲۴ ساعت، سایت شما با دامنه اختصاصی در دسترس خواهد بود.

---

# ✅ خلاصه چک‌لیست

- [ ] حساب GitHub ساخته شد
- [ ] Repository ساخته شد
- [ ] کد آپلود شد
- [ ] حساب Vercel ساخته شد
- [ ] پروژه Import شد
- [ ] Deploy موفق بود
- [ ] لینک دائمی دریافت شد
- [ ] (اختیاری) دیتابیس متصل شد
- [ ] (اختیاری) دامنه اختصاصی تنظیم شد

---

# 🎁 مزایای Vercel

✅ **لینک دائمی** - همیشه در دسترس
✅ **رایگان** - تا ۱۰۰GB bandwidth ماهانه
✅ **HTTPS خودکار** - امنیت
✅ **سرعت بالا** - CDN جهانی
✅ **Auto Deploy** - هر تغییر در GitHub، خودکار deploy می‌شود
✅ **Preview URL** - برای هر تغییر یک لینک جداگانه
✅ **Analytics** - آمار بازدید رایگان

---

# ❓ سوالات متداول

## آیا واقعاً رایگان است؟
بله. برای پروژه‌های شخصی و شرکت‌های کوچک تا ۱۰۰GB traffic ماهانه رایگان است.

## اگر ترافیک بیشتر شد چه می‌شود؟
پلن **Pro** ماهی ۲۰ دلار است. اما برای شروع نیازی نیست.

## چطور تغییرات را deploy کنم؟
هر بار که در GitHub تغییری push کنید، Vercel به‌طور خودکار deploy می‌کند. **بدون کار اضافه!**

## می‌توانم چند سایت داشته باشم؟
بله. Vercel محدودیت تعداد پروژه ندارد.

## اطلاعات من امن است؟
بله. Vercel از رمزنگاری end-to-end استفاده می‌کند و ISO 27001 دارد. اما اگر داده‌های حساس دارید، توصیه می‌کنم روی سرور داخلی شرکت deploy کنید.

## اگر مشکلی پیش آمد؟
- Logs را در Vercel Dashboard ببینید
- به من در Arena بگویید تا کمک کنم

---

# 🆘 راه ارتباط برای پشتیبانی

هر جای این راهنما گیر کردید، فقط بگویید:
- در کدام گام هستید؟
- چه خطایی می‌بینید؟
- اسکرین‌شات (اگر ممکن است)

من گام به گام کمک می‌کنم! 💪
