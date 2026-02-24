#!/bin/bash

# DeployNet Backend Environment Setup Script
# This script helps you set up the required environment variables

set -e

echo "🚀 DeployNet Backend Environment Setup"
echo "======================================"
echo

# Check if .env already exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "Creating .env file from template..."
    
    # Check if .env.example exists
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Created .env from .env.example"
    else
        # Create basic .env template
        cat > .env << 'EOF'
# Database Configuration
DATABASE_URL=

# JWT Configuration
JWT_SECRET=

# MinIO Configuration
MINIO_ENDPOINT=
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_USE_SSL=false

# Deployment Configuration
DEPLOY_DOMAIN=

# Server Configuration
PORT=8080
AUTH_PAGE_URL=http://localhost:3000

# OAuth Configuration (Optional)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
EOF
        echo "✅ Created basic .env template"
    fi
    echo
    echo "Now let's configure all the required variables..."
else
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
fi

# Function to prompt for required variables
prompt_required() {
    local var_name=$1
    local description=$2
    local example=$3
    
    echo
    echo "📝 $description"
    if [ ! -z "$example" ]; then
        echo "   Example: $example"
    fi
    
    while true; do
        read -p "   Enter $var_name: " value
        if [ ! -z "$value" ]; then
            # Escape special characters for sed
            escaped_value=$(printf '%s\n' "$value" | sed 's/[[\.*^$()+?{|]/\\&/g')
            sed -i "s|^$var_name=.*|$var_name=$escaped_value|" .env
            break
        else
            echo "   ❌ This field is required!"
        fi
    done
}

# Function to prompt for optional variables
prompt_optional() {
    local var_name=$1
    local description=$2
    local default_value=$3
    
    echo
    echo "📝 $description (optional)"
    echo "   Default: $default_value"
    read -p "   Enter $var_name (press Enter for default): " value
    
    if [ ! -z "$value" ]; then
        escaped_value=$(printf '%s\n' "$value" | sed 's/[[\.*^$()+?{|]/\\&/g')
        sed -i "s|^$var_name=.*|$var_name=$escaped_value|" .env
    fi
}

echo
echo "🔧 Setting up required environment variables..."

# Required variables
prompt_required "DATABASE_URL" "PostgreSQL connection string"
prompt_required "JWT_SECRET" "JWT secret key (min 32 characters)"
prompt_required "MINIO_ENDPOINT" "MinIO server endpoint" 
prompt_required "MINIO_ACCESS_KEY" "MinIO access key" 
prompt_required "MINIO_SECRET_KEY" "MinIO secret key" 
prompt_required "DEPLOY_DOMAIN" "Domain for deployments"

echo
echo "⚙️  Setting up optional environment variables..."

# Optional variables
prompt_optional "MINIO_USE_SSL" "Use SSL for MinIO connection" "false"
prompt_optional "AUTH_PAGE_URL" "Auth page URL" "http://localhost:3000"
prompt_optional "PORT" "Server port" "8080"

echo
echo "🔐 OAuth configuration (optional - press Enter to skip)..."
prompt_optional "GITHUB_CLIENT_ID" "GitHub OAuth Client ID" ""
prompt_optional "GITHUB_CLIENT_SECRET" "GitHub OAuth Client Secret" ""
prompt_optional "GOOGLE_CLIENT_ID" "Google OAuth Client ID" ""
prompt_optional "GOOGLE_CLIENT_SECRET" "Google OAuth Client Secret" ""

echo
echo "✅ Environment setup complete!"
echo
echo "📋 Next steps:"
echo "   1. Review your .env file: cat .env"
echo "   2. Start the backend: go run main.go"
echo "   3. Or build and run: go build -o deploynet-backend && ./deploynet-backend"
echo
echo "🔒 Security reminder:"
echo "   - Never commit your .env file to version control"
echo "   - Use strong, unique secrets in production"
echo "   - Regularly rotate your JWT secret and API keys"
echo