#!/bin/bash

# MIA Logistics Manager - Google Cloud Platform Deployment Script
# Triển khai GCP setup theo GOOGLE_CLOUD_SETUP.md

set -e  # Exit on any error

echo "🚀 MIA Logistics Manager - GCP Deployment"
echo "=========================================="
echo ""

# Configuration
PROJECT_ID="mia-logistics-prod"
PROJECT_NAME="MIA Logistics Production"
SERVICE_ACCOUNT_NAME="mia-logistics-service"
SERVICE_ACCOUNT_DISPLAY_NAME="MIA Logistics Service Account"
BILLING_ACCOUNT_ID="YOUR_BILLING_ACCOUNT_ID"  # Cần cập nhật

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if gcloud is installed
check_gcloud() {
    if ! command -v gcloud &> /dev/null; then
        print_error "gcloud CLI is not installed. Please install it first."
        echo "Visit: https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
    print_status "gcloud CLI is installed"
}

# Check if user is authenticated
check_auth() {
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
        print_error "Not authenticated with gcloud. Please run 'gcloud auth login' first."
        exit 1
    fi
    print_status "User is authenticated with gcloud"
}

# Create Google Cloud Project
create_project() {
    print_info "Creating Google Cloud Project..."

    if gcloud projects describe $PROJECT_ID &> /dev/null; then
        print_warning "Project $PROJECT_ID already exists"
    else
        gcloud projects create $PROJECT_ID --name="$PROJECT_NAME"
        print_status "Project $PROJECT_ID created"
    fi

    gcloud config set project $PROJECT_ID
    print_status "Project set to $PROJECT_ID"
}

# Enable billing
enable_billing() {
    print_info "Enabling billing..."

    if [ "$BILLING_ACCOUNT_ID" = "YOUR_BILLING_ACCOUNT_ID" ]; then
        print_warning "Please update BILLING_ACCOUNT_ID in the script"
        echo "Run: gcloud billing accounts list"
        echo "Then update BILLING_ACCOUNT_ID in this script"
        return 1
    fi

    gcloud beta billing projects link $PROJECT_ID --billing-account=$BILLING_ACCOUNT_ID
    print_status "Billing enabled for project $PROJECT_ID"
}

# Enable required APIs
enable_apis() {
    print_info "Enabling required APIs..."

    local apis=(
        "sheets.googleapis.com"
        "drive.googleapis.com"
        "script.googleapis.com"
        "maps-backend.googleapis.com"
        "places-backend.googleapis.com"
        "directions-backend.googleapis.com"
        "distance-matrix-backend.googleapis.com"
        "geocoding-backend.googleapis.com"
        "geolocation.googleapis.com"
        "monitoring.googleapis.com"
    )

    for api in "${apis[@]}"; do
        gcloud services enable $api
        print_status "Enabled $api"
    done
}

# Create service account
create_service_account() {
    print_info "Creating service account..."

    if gcloud iam service-accounts describe $SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com &> /dev/null; then
        print_warning "Service account $SERVICE_ACCOUNT_NAME already exists"
    else
        gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
            --display-name="$SERVICE_ACCOUNT_DISPLAY_NAME" \
            --description="Service account for MIA Logistics Manager"
        print_status "Service account $SERVICE_ACCOUNT_NAME created"
    fi

    # Get service account email
    SA_EMAIL="$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"
    print_status "Service account email: $SA_EMAIL"
}

# Grant roles to service account
grant_roles() {
    print_info "Granting roles to service account..."

    local roles=(
        "roles/sheets.editor"
        "roles/drive.file"
        "roles/script.developer"
    )

    for role in "${roles[@]}"; do
        gcloud projects add-iam-policy-binding $PROJECT_ID \
            --member="serviceAccount:$SA_EMAIL" \
            --role="$role"
        print_status "Granted role $role to service account"
    done
}

# Create service account key
create_service_account_key() {
    print_info "Creating service account key..."

    mkdir -p credentials

    gcloud iam service-accounts keys create credentials/service-account-key.json \
        --iam-account=$SA_EMAIL

    print_status "Service account key created in credentials/service-account-key.json"
    print_warning "Keep this key secure and do not commit it to version control"
}

# Create API key for Maps
create_api_key() {
    print_info "Creating API key for Maps..."

    # Create API key
    API_KEY_ID=$(gcloud alpha services api-keys create \
        --display-name="MIA Logistics Maps API Key" \
        --format="value(name)" \
        --quiet)

    print_status "API key created: $API_KEY_ID"

    # Get the actual API key value
    API_KEY_VALUE=$(gcloud alpha services api-keys get-key-string $API_KEY_ID)
    print_status "API key value: $API_KEY_VALUE"

    # Restrict API key
    gcloud alpha services api-keys update $API_KEY_ID \
        --api-target=maps-backend.googleapis.com \
        --api-target=places-backend.googleapis.com \
        --api-target=directions-backend.googleapis.com \
        --api-target=distance-matrix-backend.googleapis.com \
        --api-target=geocoding-backend.googleapis.com

    print_status "API key restricted to Maps APIs"
}

# Create monitoring dashboard
create_monitoring_dashboard() {
    print_info "Creating monitoring dashboard..."

    if [ -f "monitoring/dashboard-config.yaml" ]; then
        gcloud alpha monitoring dashboards create \
            --config-from-file=monitoring/dashboard-config.yaml
        print_status "Monitoring dashboard created"
    else
        print_warning "Dashboard config file not found: monitoring/dashboard-config.yaml"
    fi
}

# Create alert policy
create_alert_policy() {
    print_info "Creating alert policy..."

    if [ -f "monitoring/api-quota-policy.yaml" ]; then
        gcloud alpha monitoring policies create \
            --policy-from-file=monitoring/api-quota-policy.yaml
        print_status "Alert policy created"
    else
        print_warning "Alert policy file not found: monitoring/api-quota-policy.yaml"
    fi
}

# Setup OAuth 2.0 (manual steps)
setup_oauth() {
    print_info "Setting up OAuth 2.0..."

    echo "Manual steps required for OAuth 2.0 setup:"
    echo "1. Go to: https://console.cloud.google.com/apis/credentials?project=$PROJECT_ID"
    echo "2. Click 'Create Credentials' > 'OAuth 2.0 Client ID'"
    echo "3. Select 'Web application'"
    echo "4. Add authorized origins:"
    echo "   - http://localhost:3000"
    echo "   - https://yourdomain.com"
    echo "5. Add authorized redirect URIs:"
    echo "   - http://localhost:3000/auth/google/callback"
    echo "   - https://yourdomain.com/auth/google/callback"
    echo "6. Save the Client ID and Client Secret"

    print_warning "OAuth 2.0 setup requires manual configuration in the console"
}

# Create Google Sheets and Drive structure
setup_google_sheets() {
    print_info "Setting up Google Sheets and Drive structure..."

    echo "To setup Google Sheets and Drive structure:"
    echo "1. Go to: https://script.google.com"
    echo "2. Create a new project"
    echo "3. Copy the code from: google-apps-script/MIALogisticsSetup.gs"
    echo "4. Run the setupMIALogistics() function"
    echo "5. Note down the spreadsheet ID and folder IDs"

    print_warning "Google Sheets setup requires manual configuration in Apps Script"
}

# Update environment variables
update_env() {
    print_info "Updating environment variables..."

    if [ -f ".env" ]; then
        # Backup existing .env
        cp .env .env.backup
        print_status "Backed up existing .env file"
    fi

    # Create new .env with GCP configuration
    cat > .env << EOF
# Google Cloud Platform Configuration
REACT_APP_GOOGLE_PROJECT_ID=$PROJECT_ID
REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL=$SA_EMAIL

# Google APIs Configuration
REACT_APP_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
REACT_APP_GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
REACT_APP_GOOGLE_API_KEY=$API_KEY_VALUE
REACT_APP_GOOGLE_SPREADSHEET_ID=YOUR_SPREADSHEET_ID_HERE
REACT_APP_GOOGLE_APPS_SCRIPT_ID=YOUR_APPS_SCRIPT_ID_HERE
REACT_APP_APPS_SCRIPT_WEB_APP_URL=YOUR_WEB_APP_URL_HERE

# Feature Flags
REACT_APP_USE_MOCK_DATA=false
REACT_APP_ENABLE_GOOGLE_SHEETS=true
REACT_APP_ENABLE_GOOGLE_APPS_SCRIPT=true
REACT_APP_ENABLE_GOOGLE_DRIVE=true

# Development Configuration
NODE_ENV=development
REACT_APP_ENV=development

# Google Maps Configuration
REACT_APP_GOOGLE_MAPS_API_KEY=$API_KEY_VALUE

# Monitoring Configuration
REACT_APP_ENABLE_MONITORING=true
REACT_APP_MONITORING_PROJECT_ID=$PROJECT_ID
EOF

    print_status "Updated .env file with GCP configuration"
    print_warning "Please update the placeholder values in .env file"
}

# Test deployment
test_deployment() {
    print_info "Testing deployment..."

    # Test API access
    echo "Testing API access..."

    # Test Sheets API
    if gcloud services list --enabled --filter="name:sheets.googleapis.com" | grep -q "sheets.googleapis.com"; then
        print_status "Google Sheets API is enabled"
    else
        print_error "Google Sheets API is not enabled"
    fi

    # Test Drive API
    if gcloud services list --enabled --filter="name:drive.googleapis.com" | grep -q "drive.googleapis.com"; then
        print_status "Google Drive API is enabled"
    else
        print_error "Google Drive API is not enabled"
    fi

    # Test Maps API
    if gcloud services list --enabled --filter="name:maps-backend.googleapis.com" | grep -q "maps-backend.googleapis.com"; then
        print_status "Google Maps API is enabled"
    else
        print_error "Google Maps API is not enabled"
    fi

    # Test service account
    if gcloud iam service-accounts describe $SA_EMAIL &> /dev/null; then
        print_status "Service account is properly configured"
    else
        print_error "Service account configuration failed"
    fi
}

# Main deployment function
main() {
    echo "Starting GCP deployment for MIA Logistics Manager..."
    echo ""

    # Check prerequisites
    check_gcloud
    check_auth

    # Deploy GCP resources
    create_project
    enable_billing
    enable_apis
    create_service_account
    grant_roles
    create_service_account_key
    create_api_key
    create_monitoring_dashboard
    create_alert_policy

    # Setup OAuth and Google Sheets (manual steps)
    setup_oauth
    setup_google_sheets

    # Update environment variables
    update_env

    # Test deployment
    test_deployment

    echo ""
    print_status "GCP deployment completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Complete OAuth 2.0 setup in Google Cloud Console"
    echo "2. Setup Google Sheets and Drive structure in Apps Script"
    echo "3. Update placeholder values in .env file"
    echo "4. Test the application with: npm start"
    echo ""
    echo "Documentation:"
    echo "- GOOGLE_CLOUD_SETUP.md: Detailed setup guide"
    echo "- GOOGLE_SETUP_GUIDE.md: Basic setup guide"
    echo "- GOOGLE_APIS_DEPLOYMENT.md: Deployment guide"
    echo ""
    print_warning "Keep your service account key and API keys secure!"
}

# Run main function
main "$@"
