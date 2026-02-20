#!/bin/bash

# =============================================================================
# 🔒 HTTPS SETUP SCRIPT
# =============================================================================
# Generate self-signed SSL certificates for local development
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║              🔒 HTTPS SETUP FOR LOCAL DEVELOPMENT                ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Create certs directory
CERT_DIR="./certs"
mkdir -p $CERT_DIR

echo -e "${YELLOW}📝 Generating self-signed SSL certificates...${NC}"

# Generate private key
openssl genrsa -out $CERT_DIR/key.pem 2048

# Generate certificate
openssl req -new -x509 \
  -key $CERT_DIR/key.pem \
  -out $CERT_DIR/cert.pem \
  -days 365 \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

echo -e "${GREEN}✅ Certificates generated successfully!${NC}"
echo ""
echo "Certificate location:"
echo "  - Private Key: $CERT_DIR/key.pem"
echo "  - Certificate: $CERT_DIR/cert.pem"
echo ""
echo -e "${YELLOW}⚠️  Note: These are self-signed certificates for development only.${NC}"
echo -e "${YELLOW}   For production, use certificates from a trusted CA like Let's Encrypt.${NC}"
echo ""
echo "To use HTTPS in your server:"
echo ""
echo "const https = require('https');"
echo "const fs = require('fs');"
echo ""
echo "const options = {"
echo "  key: fs.readFileSync('certs/key.pem'),"
echo "  cert: fs.readFileSync('certs/cert.pem')"
echo "};"
echo ""
echo "https.createServer(options, app).listen(443);"
echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"

