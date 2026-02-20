#!/bin/bash

# 🚀 React OAS Integration v4.0 - Main Deployment Script
# Deploy to Netlify + Render (auto-deploy from GitHub)

# Get script directory and change to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Emojis
ROCKET="🚀"
CHECK="✅"
WARNING="⚠️"
GEAR="⚙️"
CLOUD="☁️"
PACKAGE="📦"

echo -e "${BLUE}${ROCKET} React Google Integration - Quick Deploy${NC}"
echo -e "${CYAN}================================================${NC}"
echo ""

# Function to show usage
show_usage() {
    echo -e "${YELLOW}Usage:${NC}"
    echo -e "  ${GREEN}./deploy.sh${NC} [commit_message]"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo -e "  ${GREEN}./deploy.sh \"Fix navigation bug\"${NC}"
    echo -e "  ${GREEN}./deploy.sh \"Add new feature\"${NC}"
    echo -e "  ${GREEN}./deploy.sh${NC}  (will prompt for message)"
    echo ""
    exit 1
}

# Check if help is requested
if [[ "$1" == "-h" || "$1" == "--help" ]]; then
    show_usage
fi

# Get commit message
if [ -z "$1" ]; then
    echo -e "${YELLOW}💬 Enter commit message:${NC}"
    read -p "Message: " COMMIT_MESSAGE
else
    COMMIT_MESSAGE="$1"
fi

# Validate commit message
if [ -z "$COMMIT_MESSAGE" ]; then
    echo -e "${RED}${WARNING} Error: Commit message cannot be empty${NC}"
    exit 1
fi

echo -e "${BLUE}${GEAR} Starting deployment process...${NC}"
echo ""

# Step 1: Check git status
echo -e "${CYAN}${PACKAGE} Step 1: Checking git status...${NC}"
git status --porcelain > /dev/null
if [ $? -ne 0 ]; then
    echo -e "${RED}${WARNING} Error: Not a git repository${NC}"
    exit 1
fi

# Check if there are changes
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}${WARNING} No changes detected. Creating empty commit...${NC}"
    git commit --allow-empty -m "${COMMIT_MESSAGE}"
else
    echo -e "${GREEN}${CHECK} Changes detected${NC}"
    
    # Step 2: Build frontend
    echo -e "${CYAN}${PACKAGE} Step 2: Building frontend...${NC}"
    npm run build
    if [ $? -ne 0 ]; then
        echo -e "${RED}${WARNING} Error: Frontend build failed${NC}"
        exit 1
    fi
    echo -e "${GREEN}${CHECK} Frontend build successful${NC}"
    
    # Step 3: Add all changes
    echo -e "${CYAN}${PACKAGE} Step 3: Adding changes to git...${NC}"
    git add .
    echo -e "${GREEN}${CHECK} All changes added${NC}"
    
    # Step 4: Commit changes
    echo -e "${CYAN}${PACKAGE} Step 4: Committing changes...${NC}"
    git commit -m "${COMMIT_MESSAGE}"
    if [ $? -ne 0 ]; then
        echo -e "${RED}${WARNING} Error: Commit failed${NC}"
        exit 1
    fi
    echo -e "${GREEN}${CHECK} Changes committed${NC}"
fi

# Step 5: Pull latest changes before pushing
echo -e "${CYAN}${PACKAGE} Step 5: Pulling latest changes from remote...${NC}"
CURRENT_BRANCH=$(git branch --show-current)
if git fetch origin "$CURRENT_BRANCH" 2>/dev/null; then
    LOCAL=$(git rev-parse @)
    REMOTE=$(git rev-parse @{u} 2>/dev/null || echo "")
    
    if [ -n "$REMOTE" ] && [ "$LOCAL" != "$REMOTE" ]; then
        echo -e "${YELLOW}${WARNING} Local branch is behind remote. Attempting to merge...${NC}"
        
        # Try to merge
        if git pull --no-rebase origin "$CURRENT_BRANCH" 2>&1 | tee /tmp/git-pull.log; then
            echo -e "${GREEN}${CHECK} Successfully merged remote changes${NC}"
        else
            if grep -q "CONFLICT" /tmp/git-pull.log; then
                echo -e "${RED}${WARNING} Merge conflict detected!${NC}"
                echo -e "${YELLOW}Please resolve conflicts manually and run:${NC}"
                echo -e "  ${GREEN}git add .${NC}"
                echo -e "  ${GREEN}git commit -m 'Resolve merge conflicts'${NC}"
                echo -e "  ${GREEN}git push origin $CURRENT_BRANCH${NC}"
                rm -f /tmp/git-pull.log
                exit 1
            else
                echo -e "${YELLOW}${WARNING} Pull failed, but continuing...${NC}"
            fi
        fi
        rm -f /tmp/git-pull.log
    else
        echo -e "${GREEN}${CHECK} Local branch is up to date${NC}"
    fi
else
    echo -e "${YELLOW}${WARNING} Could not fetch from remote, continuing...${NC}"
fi

# Step 6: Push to GitHub
echo -e "${CYAN}${PACKAGE} Step 6: Pushing to GitHub...${NC}"
if git push origin "$CURRENT_BRANCH" 2>&1 | tee /tmp/git-push.log; then
    echo -e "${GREEN}${CHECK} Successfully pushed to GitHub${NC}"
    rm -f /tmp/git-push.log
else
    if grep -q "non-fast-forward\|rejected" /tmp/git-push.log; then
        echo -e "${RED}${WARNING} Push rejected: Branch is behind remote${NC}"
        echo -e "${YELLOW}Please pull and merge manually:${NC}"
        echo -e "  ${GREEN}git pull origin $CURRENT_BRANCH${NC}"
        echo -e "  ${GREEN}git push origin $CURRENT_BRANCH${NC}"
        rm -f /tmp/git-push.log
        exit 1
    else
        echo -e "${RED}${WARNING} Error: Push to GitHub failed${NC}"
        rm -f /tmp/git-push.log
        exit 1
    fi
fi

echo ""
echo -e "${PURPLE}${CLOUD} Deployment Status:${NC}"
echo -e "${GREEN}${CHECK} Frontend: Will auto-deploy to Netlify (3-5 minutes)${NC}"
echo -e "${GREEN}${CHECK} Backend: Will auto-deploy to Render (5-10 minutes)${NC}"
echo ""

echo -e "${BLUE}${ROCKET} Production URLs:${NC}"
echo -e "${CYAN}Frontend: https://leafy-baklava-595711.netlify.app/${NC}"
echo -e "${CYAN}Backend:  https://react-google-backend.onrender.com${NC}"
echo ""

echo -e "${GREEN}${CHECK} Deployment completed successfully!${NC}"
echo -e "${YELLOW}💡 Tip: Monitor deployment status on Netlify and Render dashboards${NC}"
echo ""
