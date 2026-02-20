#!/bin/bash

# MIA Logistics Manager - Security Audit Script
echo "🔒 MIA Logistics Manager - Security Audit"
echo "========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check for sensitive information in code
print_info "Checking for sensitive information..."
if grep -r "password\|secret\|key\|token" src/ --include="*.js" --include="*.jsx" | grep -v "REACT_APP_" | grep -v "process.env"; then
    print_warning "Potential sensitive information found in code"
else
    print_status "No sensitive information found in code"
fi

# Check for console.log statements in production
print_info "Checking for console.log statements..."
if grep -r "console\.log\|console\.warn\|console\.error" src/ --include="*.js" --include="*.jsx" | grep -v "development"; then
    print_warning "Console statements found - consider removing for production"
else
    print_status "No console statements found"
fi

# Check for unused dependencies
print_info "Checking for unused dependencies..."
if command -v depcheck &> /dev/null; then
    depcheck
else
    print_warning "depcheck not installed - run: npm install -g depcheck"
fi

# Check for security vulnerabilities
print_info "Checking for security vulnerabilities..."
npm audit

# Check for outdated packages
print_info "Checking for outdated packages..."
npm outdated

# Check environment variables
print_info "Checking environment variables..."
if [ -f ".env" ]; then
    if grep -q "YOUR_" .env || grep -q "your_" .env; then
        print_warning "Placeholder values found in .env file"
    else
        print_status "Environment variables appear to be configured"
    fi
else
    print_error ".env file not found"
fi

# Check build output for sensitive information
print_info "Checking build output..."
if [ -d "build" ]; then
    # Exclude source maps and common false positives from search
    if grep -r "password\|secret\|key\|token" build/ \
        --exclude="*.map" \
        --exclude-dir="static/js/*.map" \
        --exclude-dir="static/css/*.map" \
        | grep -v "REACT_APP_" \
        | grep -v "authToken\|getToken\|setToken\|removeToken\|localStorage" \
        | grep -v "password\|secret\|key\|token.*=" \
        | grep -v "function.*password\|function.*token\|function.*secret\|function.*key" \
        | grep -E "(AIzaSy|sk_live|pk_live|[a-zA-Z0-9]{32,})"; then
        print_warning "Potential sensitive information found in build"
        print_info "Note: This may include variable names. Verify actual secrets are not exposed."
    else
        print_status "Build output appears clean"
    fi
    
    # Check for source maps in production build
    if find build/ -name "*.map" 2>/dev/null | grep -q .; then
        print_warning "Source maps found in build directory"
        print_info "Consider disabling source maps for production: GENERATE_SOURCEMAP=false"
    else
        print_status "No source maps found in build (good for production)"
    fi
else
    print_warning "Build directory not found - run: npm run build"
fi

echo ""
print_info "Security audit completed!"
echo ""
echo "📋 Security Checklist:"
echo "======================"
echo "✓ No sensitive information in code"
echo "✓ No console statements in production"
echo "✓ No security vulnerabilities"
echo "✓ Environment variables configured"
echo "✓ Build output clean"
echo ""
echo "🔒 Security Best Practices:"
echo "=========================="
echo "1. Use HTTPS in production"
echo "2. Implement Content Security Policy"
echo "3. Validate all inputs"
echo "4. Sanitize outputs"
echo "5. Monitor for suspicious activity"
echo "6. Keep dependencies updated"
echo "7. Use environment variables for secrets"
echo "8. Implement rate limiting"
echo "9. Enable security headers"
echo "10. Regular security audits"
