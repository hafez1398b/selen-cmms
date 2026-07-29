#!/bin/bash
# ═════════════════════════════════════════════════════════════
# Selen CMMS - Automatic Installation Script for Ubuntu Server
# نصب خودکار سامانه سلن روی سرور اوبونتو
# ═════════════════════════════════════════════════════════════

set -e

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  نصب خودکار سامانه CMMS سلن                              ║"
echo "║  Selen CMMS Auto-Installer                              ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

info() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[✓]${NC} $1"; }
warning() { echo -e "${YELLOW}[!]${NC} $1"; }

# Check root
if [ "$EUID" -ne 0 ]; then
  warning "این اسکریپت باید با sudo اجرا شود"
  exit 1
fi

# Get inputs
echo ""
read -p "دامنه (مثل cmms.selen.ir - اگر ندارید Enter بزنید): " DOMAIN
read -p "رمز عبور PostgreSQL (قوی انتخاب کنید): " DB_PASSWORD
echo ""

# 1. System Update
info "به‌روزرسانی سیستم..."
apt update -qq && apt upgrade -y -qq
success "سیستم به‌روز شد"

# 2. Install Node.js 20
info "نصب Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
apt install -y -qq nodejs
success "Node.js نصب شد ($(node -v))"

# 3. Install PostgreSQL
info "نصب PostgreSQL 15..."
apt install -y -qq postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql
success "PostgreSQL نصب شد"

# 4. Create database
info "ایجاد دیتابیس..."
sudo -u postgres psql <<EOF
CREATE DATABASE selen_cmms;
CREATE USER selen WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE selen_cmms TO selen;
ALTER DATABASE selen_cmms OWNER TO selen;
\q
EOF
success "دیتابیس ایجاد شد"

# 5. Install Nginx
info "نصب Nginx..."
apt install -y -qq nginx
success "Nginx نصب شد"

# 6. Install PM2
info "نصب PM2..."
npm install -g pm2 --silent
success "PM2 نصب شد"

# 7. Install Git
info "نصب Git..."
apt install -y -qq git
success "Git نصب شد"

# 8. Clone project (or copy)
info "دانلود پروژه..."
mkdir -p /var/www
cd /var/www

if [ -d "selen-cmms" ]; then
  warning "پوشه selen-cmms موجود است. حذف می‌شود..."
  rm -rf selen-cmms
fi

# اینجا باید ZIP یا Git URL قرار بگیره
read -p "آدرس GitHub Repository (مثل https://github.com/user/selen-cmms.git): " REPO_URL

if [ -n "$REPO_URL" ]; then
  git clone $REPO_URL selen-cmms
  cd selen-cmms
else
  warning "شما باید ZIP رو دستی در /var/www/selen-cmms قرار دهید"
  mkdir selen-cmms
  cd selen-cmms
fi

# 9. Install dependencies
info "نصب پکیج‌ها (ممکن است چند دقیقه طول بکشد)..."
npm install --silent
success "پکیج‌ها نصب شدند"

# 10. Create .env
info "ایجاد فایل تنظیمات..."
cat > .env <<EOF
DATABASE_URL=postgresql://selen:$DB_PASSWORD@localhost:5432/selen_cmms
NODE_ENV=production
PORT=3000
EOF
success "فایل .env ایجاد شد"

# 11. Push schema
info "اعمال ساختار دیتابیس..."
npx drizzle-kit push --force 2>/dev/null || warning "بعداً دستی: npx drizzle-kit push"

# 12. Build
info "ساخت نسخه Production (2-3 دقیقه)..."
npm run build
success "Build کامل شد"

# 13. Start with PM2
info "راه‌اندازی با PM2..."
pm2 stop selen-cmms 2>/dev/null || true
pm2 delete selen-cmms 2>/dev/null || true
pm2 start npm --name "selen-cmms" -- start
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash
success "سایت روی port 3000 در حال اجراست"

# 14. Nginx config
info "تنظیم Nginx..."
NGINX_DOMAIN=${DOMAIN:-_}

cat > /etc/nginx/sites-available/selen-cmms <<EOF
server {
    listen 80;
    server_name $NGINX_DOMAIN;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/selen-cmms /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl restart nginx
success "Nginx تنظیم شد"

# 15. Firewall
info "تنظیم Firewall..."
ufw allow 22/tcp -q 2>/dev/null || true
ufw allow 80/tcp -q 2>/dev/null || true
ufw allow 443/tcp -q 2>/dev/null || true
success "Firewall تنظیم شد"

# 16. SSL (optional)
if [ -n "$DOMAIN" ]; then
  read -p "آیا SSL رایگان (HTTPS) نصب شود? [y/N]: " INSTALL_SSL
  if [ "$INSTALL_SSL" = "y" ] || [ "$INSTALL_SSL" = "Y" ]; then
    info "نصب Let's Encrypt SSL..."
    apt install -y -qq certbot python3-certbot-nginx
    certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN --redirect
    success "HTTPS فعال شد"
  fi
fi

# Get server IP
SERVER_IP=$(curl -s ifconfig.me || echo "your-server-ip")

# Final message
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  ✅ نصب با موفقیت تکمیل شد!                              ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
success "سایت شما در این آدرس‌ها در دسترس است:"
echo ""
if [ -n "$DOMAIN" ]; then
  echo "   🌐 http://$DOMAIN"
  [ "$INSTALL_SSL" = "y" ] && echo "   🔒 https://$DOMAIN"
fi
echo "   🌐 http://$SERVER_IP"
echo ""
info "دستورات مفید:"
echo "   pm2 status              → وضعیت اجرا"
echo "   pm2 logs selen-cmms     → مشاهده لاگ"
echo "   pm2 restart selen-cmms  → راه‌اندازی مجدد"
echo "   pm2 stop selen-cmms     → توقف"
echo ""
info "برای به‌روزرسانی نسخه جدید:"
echo "   cd /var/www/selen-cmms"
echo "   git pull"
echo "   npm install"
echo "   npm run build"
echo "   pm2 restart selen-cmms"
echo ""
