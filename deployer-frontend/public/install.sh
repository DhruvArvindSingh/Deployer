#!/bin/bash

# DeployNet CLI Installation Script
# https://deployer.dsingh.fun

set -e

# Configuration
BINARY_NAME="deployer"
INSTALL_DIR="/usr/local/bin"
DOWNLOAD_URL="https://deployer-be.dsingh.fun/api/cli/latest"

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
