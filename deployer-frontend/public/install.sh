#!/bin/bash

# DeployNet CLI Installation Script
# https://deployer.dsingh.fun

set -e

# Configuration
BINARY_NAME="deployer"
INSTALL_DIR="/usr/local/bin"

# Detect OS and Arch
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

if [ "$ARCH" = "x86_64" ]; then
    ARCH="amd64"
elif [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then
    ARCH="arm64"
fi

# Try to get latest version from GitHub, fallback to backend if it fails
LATEST_TAG=$(curl -s "https://api.github.com/repos/DhruvArvindSingh/Deployer/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')

if [ -n "$LATEST_TAG" ]; then
    DOWNLOAD_URL="https://github.com/DhruvArvindSingh/Deployer/releases/download/${LATEST_TAG}/deployer-${OS}-${ARCH}"
    echo "Detected ${OS} ${ARCH}. Downloading ${LATEST_TAG} from GitHub..."
else
    DOWNLOAD_URL="https://deployer-be.dsingh.fun/api/cli/latest"
    echo "Downloading from fallback backend URL..."
fi

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BLUE}${BOLD}🚀 Installing DeployNet CLI...${NC}"

# Download binary
echo -e "Downloading from ${DOWNLOAD_URL}..."
curl -sL "$DOWNLOAD_URL" -o "$BINARY_NAME"
chmod +x "$BINARY_NAME"

# Install binary
if [ -w "$INSTALL_DIR" ]; then
    mv "$BINARY_NAME" "$INSTALL_DIR/$BINARY_NAME"
else
    echo -e "${BLUE}Moving to ${INSTALL_DIR} (requires sudo)...${NC}"
    sudo mv "$BINARY_NAME" "$INSTALL_DIR/$BINARY_NAME"
fi

echo -e "\n${GREEN}${BOLD}✓ DeployNet CLI installed successfully!${NC}"
echo -e "Run ${BOLD}deployer login${NC} to authenticate."
echo -e "Then run ${BOLD}deployer setup${NC} inside your project to configure CI/CD.\n"
