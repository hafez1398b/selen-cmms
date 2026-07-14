# 📦 ساخت فایل زیپ برای انتقال به سرور

پس از دانلود پوشه `deploy/`، برای زیپ کردن آن:

## Windows (PowerShell)
```powershell
cd path\to\project
Compress-Archive -Path deploy\* -DestinationPath baspar-cmms-deploy.zip
```

## Linux / Mac
```bash
cd path/to/project
zip -r baspar-cmms-deploy.zip deploy/
```

## با WinRAR
راست‌کلیک روی پوشه `deploy` → Add to archive → Format: ZIP

---

## 📁 محتویات نهایی فایل زیپ

```
baspar-cmms-deploy.zip (~ 100KB)
├── README.md
├── CREATE-ZIP.md
├── database/                      ← 4 فایل SQL
│   ├── 01-schema.sql             (30+ table, 65KB)
│   ├── 02-seed-data.sql          (users + equipment + parts, 45KB)
│   ├── 03-mock-history.sql       (WO history 1405/01/01 to now)
│   └── 04-indexes.sql            (performance indexes)
├── backend/                       ← Node.js API server
│   ├── package.json
│   ├── server.js                 (30+ REST endpoints)
│   └── .env.example
├── docker/                        ← Docker deployment
│   ├── docker-compose.yml        (3 services: DB + API + Nginx)
│   ├── Dockerfile.backend
│   └── nginx.conf
├── scripts/                       ← Automation
│   ├── install.sh                (Ubuntu auto-installer)
│   ├── backup.sh                 (daily DB backup)
│   ├── restore.sh                (restore from backup)
│   └── generate-passwords.js     (bcrypt hash generator)
└── docs/                          ← Complete documentation
    ├── INSTALL-UBUNTU.md         (Ubuntu deployment guide)
    ├── INSTALL-WINDOWS.md        (Windows Server guide)
    └── MAINTENANCE.md            (maintenance & troubleshooting)
```

---

## 🚀 راهنمای سریع پس از دریافت زیپ

### روی سرور Ubuntu:
```bash
# 1. آپلود زیپ
scp baspar-cmms-deploy.zip user@SERVER:/tmp/

# 2. اتصال به سرور
ssh user@SERVER

# 3. Extract
cd /tmp
unzip baspar-cmms-deploy.zip -d /opt/baspar-cmms/
cd /opt/baspar-cmms/deploy

# 4. نصب اتوماتیک
sudo bash scripts/install.sh

# 5. کپی فایل‌های frontend (dist/) از سیستم شما
# روی سیستم لوکال:
scp -r dist/ user@SERVER:/opt/baspar-cmms/deploy/docker/

# 6. راه‌اندازی همه سرویس‌ها
cd /opt/baspar-cmms/deploy/docker
docker compose up -d

# 7. سایت آماده است!
# http://SERVER_IP
```

**۷ دقیقه بعد سایت شما آماده استفاده است! 🎉**
