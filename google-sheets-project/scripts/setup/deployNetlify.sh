#!/bin/bash

# Netlify Deployment Script
echo "🚀 Deploying to Netlify..."

# Set environment
ENVIRONMENT=${1:-production}
SITE_ID=${2:-$NETLIFY_SITE_ID}

if [ -z "$NETLIFY_AUTH_TOKEN" ]; then
    echo "❌ NETLIFY_AUTH_TOKEN not set"
    exit 1
fi

if [ -z "$SITE_ID" ]; then
    echo "❌ NETLIFY_SITE_ID not set"
    exit 1
fi

# Install Netlify CLI if not installed
if ! command -v netlify &> /dev/null; then
    echo "Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Login to Netlify
netlify login --token $NETLIFY_AUTH_TOKEN

# Build application
echo "Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

# Deploy
if [ "$ENVIRONMENT" = "production" ]; then
    echo "Deploying to production..."
    netlify deploy --prod --dir=build --site=$SITE_ID
else
    echo "Deploying to staging..."
    netlify deploy --dir=build --site=$SITE_ID
fi

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
else
    echo "❌ Deployment failed"
    exit 1
fi