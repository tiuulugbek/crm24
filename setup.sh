#!/bin/bash

# Acoustic CRM - Automated Setup Script
# This script automates the setup process for development environment

set -e  # Exit on error

echo "================================"
echo "  Acoustic CRM Setup Script"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo -e "${YELLOW}Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) found${NC}"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: PostgreSQL is not installed${NC}"
    echo "Please install PostgreSQL 14+ from https://www.postgresql.org"
    exit 1
fi

echo -e "${GREEN}✓ PostgreSQL found${NC}"

# Check if Redis is installed
if ! command -v redis-cli &> /dev/null; then
    echo -e "${YELLOW}Warning: Redis is not installed${NC}"
    echo "Redis is required for queue processing. Install with:"
    echo "  Ubuntu/Debian: sudo apt-get install redis-server"
    echo "  macOS: brew install redis"
fi

echo ""
echo "================================"
echo "  Step 1: Database Setup"
echo "================================"
echo ""

# Prompt for database credentials
read -p "Enter PostgreSQL username [postgres]: " DB_USER
DB_USER=${DB_USER:-postgres}

read -sp "Enter PostgreSQL password: " DB_PASSWORD
echo ""

read -p "Enter database name [acoustic_crm]: " DB_NAME
DB_NAME=${DB_NAME:-acoustic_crm}

# Create database
echo -e "${YELLOW}Creating database...${NC}"
export PGPASSWORD=$DB_PASSWORD
psql -U $DB_USER -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "Database already exists"

# Run schema
echo -e "${YELLOW}Running database schema...${NC}"
psql -U $DB_USER -d $DB_NAME -f database/schema.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database setup complete${NC}"
else
    echo -e "${RED}✗ Database setup failed${NC}"
    exit 1
fi

echo ""
echo "================================"
echo "  Step 2: Backend Setup"
echo "================================"
echo ""

cd backend

# Install dependencies
echo -e "${YELLOW}Installing backend dependencies...${NC}"
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install backend dependencies${NC}"
    exit 1
fi

# Create .env file
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating backend .env file...${NC}"
    cp .env.example .env
    
    # Update database credentials
    sed -i.bak "s/DATABASE_USER=.*/DATABASE_USER=$DB_USER/" .env
    sed -i.bak "s/DATABASE_PASSWORD=.*/DATABASE_PASSWORD=$DB_PASSWORD/" .env
    sed -i.bak "s/DATABASE_NAME=.*/DATABASE_NAME=$DB_NAME/" .env
    
    # Generate JWT secret
    JWT_SECRET=$(openssl rand -base64 32)
    sed -i.bak "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    
    # Generate encryption key
    ENCRYPTION_KEY=$(openssl rand -hex 16)
    sed -i.bak "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env
    
    rm .env.bak
    
    echo -e "${GREEN}✓ Backend .env file created${NC}"
    echo -e "${YELLOW}⚠ Please edit backend/.env and add your API keys:${NC}"
    echo "  - Telegram Bot Token"
    echo "  - YouTube API Key"
    echo "  - Instagram credentials"
    echo "  - Facebook tokens"
    echo "  - WhatsApp API credentials"
    echo "  - Eskiz SMS credentials"
else
    echo -e "${YELLOW}Backend .env file already exists, skipping...${NC}"
fi

cd ..

echo ""
echo "================================"
echo "  Step 3: Frontend Setup"
echo "================================"
echo ""

cd frontend

# Install dependencies
echo -e "${YELLOW}Installing frontend dependencies...${NC}"
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install frontend dependencies${NC}"
    exit 1
fi

# Create .env.local file
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}Creating frontend .env file...${NC}"
    echo "VITE_API_URL=http://localhost:3000/api/v1" > .env.local
    echo -e "${GREEN}✓ Frontend .env file created${NC}"
else
    echo -e "${YELLOW}Frontend .env file already exists, skipping...${NC}"
fi

cd ..

echo ""
echo "================================"
echo "  Setup Complete!"
echo "================================"
echo ""
echo -e "${GREEN}✓ All setup steps completed successfully!${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Configure API keys in backend/.env:"
echo "   cd backend"
echo "   nano .env"
echo ""
echo "2. Start Redis (if not running):"
echo "   sudo service redis-server start"
echo ""
echo "3. Start the backend:"
echo "   cd backend"
echo "   npm run start:dev"
echo ""
echo "4. In a new terminal, start the frontend:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "5. Open your browser:"
echo "   http://localhost:5173"
echo ""
echo "6. Login with default credentials:"
echo "   Email: admin@acoustic.uz"
echo "   Password: Admin123!"
echo ""
echo -e "${YELLOW}⚠ IMPORTANT: Change the default password after first login!${NC}"
echo ""
echo "For production deployment, see README.md"
echo ""
