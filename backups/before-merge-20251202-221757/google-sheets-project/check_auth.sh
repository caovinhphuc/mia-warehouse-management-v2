#!/bin/bash

# Script to check authentication deployment status
BACKEND_URL="https://react-google-backend.onrender.com"

echo "🔍 Checking Authentication Deployment Status..."
echo "================================================"

# Check health endpoint for authentication field
echo "1. 🏥 Health Check:"
HEALTH=$(curl -s $BACKEND_URL/api/health)
echo "$HEALTH" | jq .

# Check if authentication field exists
HAS_AUTH=$(echo "$HEALTH" | jq -r '.services.authentication // "missing"')
echo ""
echo "Authentication Service: $HAS_AUTH"

# Test authentication endpoint
echo ""
echo "2. 🔐 Testing Auth Endpoint:"
AUTH_RESPONSE=$(curl -s -X POST $BACKEND_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test","password":"test"}')

echo "$AUTH_RESPONSE" | jq .

# Status summary
echo ""
echo "📊 STATUS SUMMARY:"
if [[ "$HAS_AUTH" == "true" ]]; then
    echo "✅ Authentication service is deployed"
    echo "🎯 Ready to test login!"
elif [[ "$AUTH_RESPONSE" == *"Route not found"* ]]; then
    echo "❌ Authentication endpoint not deployed yet"
    echo "⏰ Please wait 5-10 more minutes"
else
    echo "🔄 Deployment in progress..."
    echo "⏰ Check again in a few minutes"
fi

echo ""
echo "🌐 Frontend: https://leafy-baklava-595711.netlify.app/"
echo "🔧 Backend:  $BACKEND_URL"
