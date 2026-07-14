#!/bin/bash
# =====================================================
# 🔄 Baspar CMMS - Database Restore
# =====================================================
# Usage:
#   sudo bash restore.sh /var/backups/baspar-cmms/db-20260630-020000.sql.gz
# =====================================================

if [ -z "$1" ]; then
    echo "❌ Usage: $0 <backup-file.sql.gz>"
    echo ""
    echo "Available backups:"
    ls -lh /var/backups/baspar-cmms/*.sql.gz 2>/dev/null || echo "  (none found)"
    exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ File not found: $BACKUP_FILE"
    exit 1
fi

echo "⚠️  هشدار: این عمل تمام داده‌های فعلی را پاک می‌کند!"
read -p "آیا مطمئنید؟ (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "لغو شد."
    exit 0
fi

echo "🔄 در حال بازیابی از $BACKUP_FILE ..."

if docker ps --format '{{.Names}}' | grep -q baspar-postgres; then
    gunzip -c "$BACKUP_FILE" | docker exec -i baspar-postgres psql -U baspar_user -d baspar_cmms
else
    PGPASSWORD=$(grep DB_PASSWORD /opt/baspar-cmms/.env | cut -d '=' -f2) \
        gunzip -c "$BACKUP_FILE" | psql -h localhost -U baspar_user -d baspar_cmms
fi

echo "✅ بازیابی با موفقیت انجام شد."
