#!/bin/bash
# =====================================================
# 💾 Baspar CMMS - Daily Database Backup
# =====================================================
# اجرا با cron (روزانه ساعت ۲ بامداد):
#   0 2 * * * /opt/baspar-cmms/scripts/backup.sh
# =====================================================

BACKUP_DIR="/var/backups/baspar-cmms"
DATE=$(date +%Y%m%d-%H%M%S)
RETENTION_DAYS=30

mkdir -p $BACKUP_DIR

# Backup database (via docker exec)
if docker ps --format '{{.Names}}' | grep -q baspar-postgres; then
    docker exec baspar-postgres pg_dump -U baspar_user baspar_cmms | gzip > "$BACKUP_DIR/db-$DATE.sql.gz"
    echo "✅ Database backup: $BACKUP_DIR/db-$DATE.sql.gz"
else
    # Direct PostgreSQL backup
    PGPASSWORD=$(grep DB_PASSWORD /opt/baspar-cmms/.env | cut -d '=' -f2) \
        pg_dump -h localhost -U baspar_user baspar_cmms | gzip > "$BACKUP_DIR/db-$DATE.sql.gz"
fi

# Backup uploaded files (if any)
if [ -d "/opt/baspar-cmms/uploads" ]; then
    tar -czf "$BACKUP_DIR/uploads-$DATE.tar.gz" -C /opt/baspar-cmms uploads/
fi

# Delete backups older than 30 days
find $BACKUP_DIR -name "*.gz" -mtime +$RETENTION_DAYS -delete

echo "✅ Backup complete. Total files: $(ls -1 $BACKUP_DIR | wc -l)"
echo "📦 Disk usage: $(du -sh $BACKUP_DIR | cut -f1)"
