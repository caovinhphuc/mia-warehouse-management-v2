#!/bin/bash

================================
ONEAUTOMATION SYSTEM - BACKUP SCRIPT
================================
echo "💾 Starting OneAutomation System Backup..."

Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color
Configuration
BACKUP_DIR="./backups"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="oneautomation_backup_$DATE"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
Create backup directory
echo -e "${BLUE}📁 Creating backup directory...${NC}"
mkdir -p "$BACKUP_PATH"
Backup MongoDB
echo -e "${BLUE}🍃 Backing up MongoDB...${NC}"
if docker-compose exec -T mongodb mongodump --db oneautomation --out /tmp/backup > /dev/null 2>&1; then
docker cp $(docker-compose ps -q mongodb):/tmp/backup "$BACKUP_PATH/mongodb"
echo -e "${GREEN}✅ MongoDB backup completed${NC}"
else
echo -e "${RED}❌ MongoDB backup failed${NC}"
fi
Backup configuration files
echo -e "${BLUE}⚙️ Backing up configuration files...${NC}"
mkdir -p "$BACKUP_PATH/config"
cp -r config/* "$BACKUP_PATH/config/" 2>/dev/null || true
cp .env "$BACKUP_PATH/" 2>/dev/null || true
cp docker-compose.yml "$BACKUP_PATH/"
cp nginx.conf "$BACKUP_PATH/" 2>/dev/null || true
echo -e "${GREEN}✅ Configuration backup completed${NC}"
Backup logs
echo -e "${BLUE}📄 Backing up logs...${NC}"
if [ -d "logs" ]; then
cp -r logs "$BACKUP_PATH/"
echo -e "${GREEN}✅ Logs backup completed${NC}"
else
echo -e "${YELLOW}⚠️ No logs directory found${NC}"
fi
Backup uploads
echo -e "${BLUE}📤 Backing up uploads...${NC}"
if [ -d "uploads" ]; then
cp -r uploads "$BACKUP_PATH/"
echo -e "${GREEN}✅ Uploads backup completed${NC}"
else
echo -e "${YELLOW}⚠️ No uploads directory found${NC}"
fi
Create backup info file
cat > "$BACKUP_PATH/backup_info.txt" << EOF OneAutomation System Backup Information
Backup Date: $(date)
Backup Version: 1.0.0
System Status: $(docker-compose ps --services | wc -l) services
Included in this backup:

MongoDB database dump
Configuration files (.env, docker-compose.yml)
Application logs
Uploaded files
System settings
Restore Instructions:

Stop current system: ./scripts/stop.sh
Restore files to project directory
Import MongoDB: docker-compose exec mongodb mongorestore /tmp/backup/oneautomation
Start system: ./scripts/start.sh
Created by OneAutomation Backup Script
EOF
Compress backup
echo -e "${BLUE}🗜️ Compressing backup...${NC}"
cd "$BACKUP_DIR"
tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"
rm -rf "$BACKUP_NAME"
cd ..
Calculate backup size
BACKUP_SIZE=$(du -h "$BACKUP_DIR/${BACKUP_NAME}.tar.gz" | cut -f1)

echo ""
echo -e "${GREEN}🎉 Backup completed successfully!${NC}"
echo -e "${BLUE}📊 Backup Details:${NC}"
echo -e " 📁 Location: $BACKUP_DIR/${BACKUP_NAME}.tar.gz"
echo -e " 📏 Size: $BACKUP_SIZE"
echo -e " 📅 Date: $(date)"
echo ""
# Cleanup old backups (keep last 5)
echo -e "${BLUE}🧹 Cleaning up old backups...${NC}"
cd "$BACKUP_DIR"
ls -t oneautomation_backup_.tar.gz | tail -n +6 | xargs -r rm --
REMAINING=$(ls oneautomation_backup_.tar.gz 2>/dev/null | wc -l)
echo -e "${GREEN}✅ Cleanup completed. ${REMAINING} backups kept.${NC}"
cd ..
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo -e " 🔄 Automate backups with cron:"
echo -e " 0 2 * * * /path/to/scripts/backup.sh >/dev/null 2>&1"
echo ""
echo -e "${GREEN}✨ Backup process finished! ✨${NC}"
