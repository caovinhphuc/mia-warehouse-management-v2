#!/bin/bash

# ========================================================
# MIA Warehouse Management V2 - Environment Setup Script
# ========================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  MIA Warehouse Management V2 Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check Node.js
echo -e "${YELLOW}Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js >= 16.0.0${NC}"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js ${NODE_VERSION}${NC}"

# Check npm
echo -e "${YELLOW}Checking npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✅ npm ${NPM_VERSION}${NC}"
echo ""

# Check .env file
echo -e "${YELLOW}Checking .env file...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env not found. Creating from template...${NC}"
    if [ -f ".env.template" ]; then
        cp .env.template .env
        echo -e "${GREEN}✅ Created .env from template${NC}"
        echo -e "${YELLOW}⚠️  Please edit .env and add your credentials${NC}"
    else
        echo -e "${RED}❌ .env.template not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ .env exists${NC}"
fi
echo ""

# Check Google credentials
echo -e "${YELLOW}Checking Google Service Account...${NC}"
GOOGLE_CREDS_PATH="./automation/config/google-credentials.json"
if [ -f "$GOOGLE_CREDS_PATH" ]; then
    echo -e "${GREEN}✅ Google credentials found: ${GOOGLE_CREDS_PATH}${NC}"
else
    echo -e "${YELLOW}⚠️  Google credentials not found at ${GOOGLE_CREDS_PATH}${NC}"
    echo -e "${YELLOW}   Please add your service account JSON file${NC}"
fi
echo ""

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Check backend dependencies
if [ -d "backend" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    cd backend
    npm install
    cd ..
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
    echo ""
fi

# Check ports
echo -e "${YELLOW}Checking ports...${NC}"
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 3000 is in use${NC}"
else
    echo -e "${GREEN}✅ Port 3000 available${NC}"
fi

if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 3001 is in use${NC}"
else
    echo -e "${GREEN}✅ Port 3001 available${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Setup completed!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Edit .env and add your Google API credentials"
echo -e "2. Add Google Service Account JSON to: ${GOOGLE_CREDS_PATH}"
echo -e "3. Run: ${GREEN}npm run dev${NC} to start development server"
echo ""
echo -e "${BLUE}Available commands:${NC}"
echo -e "  ${GREEN}npm run dev${NC}          - Start frontend + backend"
echo -e "  ${GREEN}npm start${NC}            - Start frontend only (Vite)"
echo -e "  ${GREEN}npm run start:backend${NC} - Start backend only"
echo -e "  ${GREEN}npm run build${NC}        - Build for production"
echo ""
