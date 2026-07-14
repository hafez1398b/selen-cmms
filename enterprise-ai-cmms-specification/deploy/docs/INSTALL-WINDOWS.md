# 🪟 راهنمای نصب روی Windows Server

## پیش‌نیازها
- Windows Server 2019/2022 یا Windows 10/11 Pro
- حداقل 4GB RAM
- Administrator access

---

## 🚀 روش ساده: با Docker Desktop

### گام ۱: نصب Docker Desktop for Windows
دانلود از https://www.docker.com/products/docker-desktop
- در حین نصب، WSL 2 را فعال کنید

### گام ۲: کپی پوشه deploy به سرور
از Git، USB یا SMB share

### گام ۳: اجرا با PowerShell
```powershell
cd C:\baspar-cmms\deploy\docker

# ساخت .env
@"
DB_PASSWORD=YourStrongPassword123!
JWT_SECRET=$(([System.Web.Security.Membership]::GeneratePassword(64,0)))
CORS_ORIGIN=*
"@ | Out-File -Encoding utf8 .env

# اجرای همه سرویس‌ها
docker compose up -d

# بررسی
docker compose ps
```

سایت در `http://localhost` در دسترس است!

---

## 🔧 روش دستی: PostgreSQL + Node + IIS

### گام ۱: نصب PostgreSQL 15
دانلود از https://www.postgresql.org/download/windows/
- در حین نصب، رمز `postgres` را انتخاب کنید
- پورت پیش‌فرض: 5432

### گام ۲: ساخت دیتابیس
```powershell
# باز کردن SQL Shell (psql)
CREATE DATABASE baspar_cmms WITH ENCODING 'UTF8';
CREATE USER baspar_user WITH PASSWORD 'YourStrongPassword';
GRANT ALL PRIVILEGES ON DATABASE baspar_cmms TO baspar_user;

# اجرای SQL scripts:
\c baspar_cmms
\i C:/baspar-cmms/deploy/database/01-schema.sql
\i C:/baspar-cmms/deploy/database/02-seed-data.sql
\i C:/baspar-cmms/deploy/database/03-mock-history.sql
\i C:/baspar-cmms/deploy/database/04-indexes.sql
```

### گام ۳: Node.js Backend
```powershell
# دانلود Node.js LTS از nodejs.org

cd C:\baspar-cmms\deploy\backend
npm install --production
copy .env.example .env
notepad .env  # ← ویرایش تنظیمات

# اجرا به عنوان Windows Service با pm2:
npm install -g pm2 pm2-windows-startup
pm2-startup install
pm2 start server.js --name baspar-backend
pm2 save
```

### گام ۴: IIS برای Frontend

**۱. نصب IIS + URL Rewrite:**
- Server Manager → Add Roles → Web Server (IIS)
- دانلود [URL Rewrite Module](https://www.iis.net/downloads/microsoft/url-rewrite)
- دانلود [Application Request Routing](https://www.iis.net/downloads/microsoft/application-request-routing)

**۲. کپی فایل‌های Frontend:**
```powershell
xcopy /E /Y C:\baspar-cmms\dist\* C:\inetpub\wwwroot\baspar\
```

**۳. ساخت web.config در C:\inetpub\wwwroot\baspar\:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <!-- API proxy to Node backend -->
        <rule name="API Proxy" stopProcessing="true">
          <match url="^api/(.*)" />
          <action type="Rewrite" url="http://localhost:3000/api/{R:1}" />
        </rule>
        <!-- SPA routing -->
        <rule name="SPA" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <mimeMap fileExtension=".webmanifest" mimeType="application/manifest+json" />
      <mimeMap fileExtension=".woff2" mimeType="font/woff2" />
    </staticContent>
    <httpProtocol>
      <customHeaders>
        <add name="X-Frame-Options" value="SAMEORIGIN" />
        <add name="X-Content-Type-Options" value="nosniff" />
      </customHeaders>
    </httpProtocol>
  </system.webServer>
</configuration>
```

**۴. Application Pool:**
- IIS Manager → Application Pools → Add
- Name: `Baspar`
- .NET CLR Version: `No Managed Code`

**۵. Web Site:**
- IIS Manager → Sites → Add Website
- Site name: `Baspar CMMS`
- Physical path: `C:\inetpub\wwwroot\baspar`
- Application pool: `Baspar`
- Port: 80

---

## 🔒 Firewall (Windows Defender)

```powershell
New-NetFirewallRule -DisplayName "HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
New-NetFirewallRule -DisplayName "HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
New-NetFirewallRule -DisplayName "PostgreSQL" -Direction Inbound -Protocol TCP -LocalPort 5432 -Action Allow -RemoteAddress 192.168.1.0/24
```

---

## 💾 بک‌آپ اتوماتیک

Task Scheduler → Create Task:
- Trigger: Daily at 2:00 AM
- Action: `pg_dump.exe -U baspar_user -d baspar_cmms -f C:\backups\baspar-%date%.sql`

یا PowerShell script:
```powershell
$date = Get-Date -Format "yyyyMMdd-HHmmss"
$env:PGPASSWORD = "YourPassword"
& "C:\Program Files\PostgreSQL\15\bin\pg_dump.exe" `
    -U baspar_user -d baspar_cmms `
    -f "C:\backups\baspar-$date.sql"

# حذف بک‌آپ‌های بیش از 30 روز
Get-ChildItem C:\backups\*.sql | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } | Remove-Item
```

---

## 🐛 عیب‌یابی

**بررسی Backend:**
```powershell
pm2 status
pm2 logs baspar-backend
```

**بررسی IIS:**
```powershell
Get-Service W3SVC
iisreset
```

**تست Backend:**
```powershell
Invoke-WebRequest http://localhost:3000/api/health
```
