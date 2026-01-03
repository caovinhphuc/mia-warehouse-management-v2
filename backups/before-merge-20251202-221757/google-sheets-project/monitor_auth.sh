#!/bin/bash

# Real-time authentication monitoring script
BACKEND_URL="https://react-google-backend.onrender.com"
CHECK_INTERVAL=30  # seconds

echo "🔍 Real-time Authentication Monitoring"
echo "======================================"
echo "⏰ Checking every $CHECK_INTERVAL seconds..."
echo "🛑 Press Ctrl+C to stop"
echo ""

# Counter for attempts
attempt=1

while true; do
    echo "🔄 Check #$attempt - $(date)"
    echo "----------------------------------------"

    # Quick health check
    HEALTH=$(curl -s $BACKEND_URL/api/health)
    STATUS=$(echo "$HEALTH" | jq -r '.status // "ERROR"')
    HAS_AUTH=$(echo "$HEALTH" | jq -r '.services.authentication // "missing"')

    echo "Backend Status: $STATUS"
    echo "Auth Service: $HAS_AUTH"

    # Test auth endpoint
    AUTH_TEST=$(curl -s -w "%{http_code}" -X POST $BACKEND_URL/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"test","password":"test"}' \
        -o /dev/null)

    if [[ "$AUTH_TEST" == "401" || "$AUTH_TEST" == "400" ]]; then
        echo "🎉 SUCCESS! Authentication endpoint is LIVE!"
        echo "✅ HTTP Status: $AUTH_TEST (Expected for invalid credentials)"
        echo ""
        echo "🧪 Ready to test login with:"
        echo "   Email: admin@company.com"
        echo "   Password: admin123"
        echo ""
        echo "🌐 Go to: https://leafy-baklava-595711.netlify.app/login"
        break
    elif [[ "$AUTH_TEST" == "404" ]]; then
        echo "❌ Auth endpoint not ready yet (404)"
    else
        echo "🔄 Deployment in progress... (HTTP: $AUTH_TEST)"
    fi

    echo ""
    echo "⏰ Next check in $CHECK_INTERVAL seconds..."
    echo ""

    # Wait for next check
    sleep $CHECK_INTERVAL
    attempt=$((attempt + 1))
done
