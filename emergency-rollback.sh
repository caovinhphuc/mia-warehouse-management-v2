#!/bin/bash
# emergency-rollback.sh

echo "🚨 EMERGENCY ROLLBACK PROCEDURE"

# Get previous working commit
PREVIOUS_COMMIT=$(git log --oneline -n 2 | tail -1 | cut -d' ' -f1)

echo "📦 Rolling back to: $PREVIOUS_COMMIT"

# Checkout previous version
git checkout $PREVIOUS_COMMIT

# Rebuild and redeploy
npm install
npm run build:production
npm run deploy:production

echo "✅ Emergency rollback completed!"

