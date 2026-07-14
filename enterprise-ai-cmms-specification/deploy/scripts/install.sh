#!/bin/bash
# =====================================================
# 🚀 Baspar CMMS - Ubuntu 22.04 Auto-Installer
# =====================================================
# نصب کامل روی Ubuntu 22.04/24.04 با یک دستور:
#   sudo bash install.sh
# =====================================================

set -e

echo "╔══════════════════════════════════════════════════╗"
echo "║  🏭 Baspar Foam Gharb CMMS - Installer          ║"
echo "║  🎯 نصب اتوماتیک روی Ubuntu Server               ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

if [[ $EUID -ne 0 ]]; then
   echo "❌ این اسکریپت را با sudo اجرا کنید"
   exit 1
fi

# Detect OS
if ! command -v apt-get &> /dev/null; then
    echo "❌ این اسکریپت فقط روی Ubuntu/Debian کار می‌کند"
    exit 1
fi

echo "📦 [1/7] نصب وابستگی‌ها..."
apt-get update -qq
apt-get install -y -qq \
    curl wget git \
    ca-certificates gnupg lsb-release \
    ufw fail2ban unattended-upgrades

echo "🐳 [2/7] نصب Docker + Docker Compose..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable --now docker
fi

echo "🐘 [3/7] نصب PostgreSQL 15 (اختیاری، برای دسترسی مستقیم)..."
if ! command -v psql &> /dev/null; then
    sh -c 'echo "deb https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
    apt-get update -qq
    apt-get install -y -qq postgresql-client-15
fi

echo "🌐 [4/7] نصب Nginx..."
apt-get install -y -qq nginx
systemctl enable --now nginx

echo "🔒 [5/7] پیکربندی فایروال..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable

echo "🛡️ [6/7] فعال‌سازی به‌روزرسانی خودکار و Fail2ban..."
systemctl enable --now fail2ban
dpkg-reconfigure -f noninteractive unattended-upgrades

echo "📁 [7/7] ساخت پوشه‌های داده..."
INSTALL_DIR="/opt/baspar-cmms"
mkdir -p $INSTALL_DIR
mkdir -p /var/log/baspar-cmms
mkdir -p /var/backups/baspar-cmms

# Copy files if run from deploy/ folder
if [ -f "docker/docker-compose.yml" ]; then
    echo "📄 کپی فایل‌ها به $INSTALL_DIR ..."
    cp -r ./* $INSTALL_DIR/
    cd $INSTALL_DIR

    # Generate random JWT secret
    JWT_SECRET=$(openssl rand -hex 32)
    DB_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=')

    # Create .env
    cat > .env <<EOF
DB_PASSWORD=$DB_PASSWORD
JWT_SECRET=$JWT_SECRET
CORS_ORIGIN=*
EOF
    chmod 600 .env

    echo ""
    echo "╔══════════════════════════════════════════════════╗"
    echo "║  ✅ نصب پایه با موفقیت انجام شد!                 ║"
    echo "╚══════════════════════════════════════════════════╝"
    echo ""
    echo "📋 اطلاعات مهم:"
    echo "  📁 مسیر نصب:    $INSTALL_DIR"
    echo "  🔑 JWT Secret:  ذخیره شده در .env"
    echo "  🔒 DB Password: ذخیره شده در .env"
    echo ""
    echo "🚀 مراحل بعدی:"
    echo "  1️⃣  فایل dist/ (build شده front-end) را در $INSTALL_DIR/docker/dist/ کپی کنید"
    echo "  2️⃣  cd $INSTALL_DIR/docker && docker compose up -d"
    echo "  3️⃣  سایت در http://$(hostname -I | awk '{print $1}') در دسترس است"
    echo ""
    echo "🔑 حساب ادمین پیش‌فرض:"
    echo "     ایمیل: admin@basparfoam.ir"
    echo "     رمز:  Baspar@1234 (لطفاً پس از اولین ورود تغییر دهید)"
    echo ""
else
    echo ""
    echo "✅ ابزارها نصب شدند."
    echo "برای ادامه، این اسکریپت را از داخل پوشه deploy/ اجرا کنید."
fi
