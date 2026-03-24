#!/bin/bash
# deploy-aws.sh (production-tested)

# Build application
npm run build

# Upload to S3
aws s3 sync build/ s3://mia-integration-prod --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E1234567890123 \
  --paths "/*"

echo "✅ Deployed to AWS successfully!"
