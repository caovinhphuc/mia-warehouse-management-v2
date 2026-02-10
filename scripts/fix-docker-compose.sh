#!/bin/bash
# Fix corrupted docker-compose symlink
# This script repairs the docker-compose installation on macOS

echo "🔧 Fixing Docker Compose installation..."
echo ""

# Check if /usr/local/bin/docker-compose is corrupted
if [ -f "/usr/local/bin/docker-compose" ]; then
    FILE_TYPE=$(file /usr/local/bin/docker-compose | grep -q "ASCII text" && echo "corrupted" || echo "ok")
    if [ "$FILE_TYPE" = "corrupted" ]; then
        echo "❌ Detected corrupted docker-compose file at /usr/local/bin/docker-compose"
        echo "   File type: $(file /usr/local/bin/docker-compose)"
        echo ""
        echo "🔨 Attempting to fix..."

        # Try to remove and recreate
        if sudo rm /usr/local/bin/docker-compose 2>/dev/null; then
            echo "✅ Removed corrupted file"
        else
            echo "⚠️  Could not remove file with sudo (may require password)"
        fi
    fi
fi

# Create docker-compose wrapper in local bin
echo ""
echo "📝 Creating docker-compose wrapper script..."

WRAPPER_PATH="/usr/local/bin/docker-compose"
WRAPPER_SCRIPT=$(cat << 'WRAPPER_EOF'
#!/bin/bash
# Docker Compose wrapper - routes to docker compose (modern syntax)
# This works with Docker Desktop 4.0+ which integrated compose

DOCKER_BIN="/Applications/Docker.app/Contents/Resources/bin/docker"

if [ -x "$DOCKER_BIN" ]; then
    exec "$DOCKER_BIN" compose "$@"
else
    echo "Error: Docker not found at $DOCKER_BIN"
    echo "Please ensure Docker Desktop is installed."
    exit 1
fi
WRAPPER_EOF
)

# Try to write wrapper without sudo first
if echo "$WRAPPER_SCRIPT" | sudo tee "$WRAPPER_PATH" > /dev/null 2>&1; then
    sudo chmod +x "$WRAPPER_PATH"
    echo "✅ Created docker-compose wrapper at $WRAPPER_PATH"
else
    echo "⚠️  Could not create wrapper with sudo (permission issue)"
    echo ""
    echo "💡 Workaround: The deployment script will use Docker Desktop directly"
    echo "   The script has fallback logic to handle both cases"
fi

echo ""
echo "🔍 Verifying Docker installation..."
if [ -x "/Applications/Docker.app/Contents/Resources/bin/docker" ]; then
    DOCKER_VERSION=$("/Applications/Docker.app/Contents/Resources/bin/docker" --version 2>/dev/null)
    echo "✅ Docker found: $DOCKER_VERSION"
else
    echo "❌ Docker Desktop not found at /Applications/Docker.app"
    echo "📥 Please install Docker Desktop from: https://docs.docker.com/desktop/install/mac-install/"
    exit 1
fi

echo ""
echo "✅ Docker Compose fix completed!"
echo ""
echo "Next steps:"
echo "1. Run deployment again: ./scripts/deploy/main.sh"
echo "2. Or use: npm run deploy"
