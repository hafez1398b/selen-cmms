#!/bin/bash
# اسکریپت به‌روزرسانی سریع - در سرور اجرا شود
# استفاده: bash update.sh

set -e

echo "🔄 در حال به‌روزرسانی سامانه CMMS سلن..."
echo ""

cd /var/www/selen-cmms

echo "📥 دریافت آخرین تغییرات از GitHub..."
git pull

echo "📦 نصب پکیج‌های جدید..."
npm install --silent

echo "🏗️  ساخت نسخه جدید..."
npm run build

echo "🔄 راه‌اندازی مجدد سرور..."
pm2 restart selen-cmms

echo ""
echo "✅ به‌روزرسانی با موفقیت انجام شد!"
echo ""
pm2 status selen-cmms
