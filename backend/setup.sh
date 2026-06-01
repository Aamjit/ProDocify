#!/bin/bash
# ProDocify Development Setup Script

set -e

echo "🚀 ProDocify Backend Setup"
echo "============================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check Node.js
echo -e "${BLUE}✓ Checking Node.js...${NC}"
node -v
npm -v
echo ""

# Install dependencies
echo -e "${BLUE}✓ Installing dependencies...${NC}"
npm install
echo ""

# Setup .env
echo -e "${BLUE}✓ Setting up environment...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${YELLOW}⚠  .env created - please update with your values${NC}"
else
    echo "✓ .env already exists"
fi
echo ""

# Generate Prisma client
echo -e "${BLUE}✓ Generating Prisma client...${NC}"
npm run prisma:generate
echo ""

# Run migrations
echo -e "${BLUE}✓ Running database migrations...${NC}"
npm run prisma:migrate:dev -- --name "initial-setup"
echo ""

# Verify setup
echo -e "${BLUE}✓ Verifying setup...${NC}"
npm run build
echo ""

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Update .env with your database credentials"
echo "2. Run: npm run dev"
echo "3. Visit: http://localhost:3000/api/docs"
echo ""
echo "For help, see: docs/00_START_HERE.md"
