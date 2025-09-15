#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Construct Framework (Go API + Vue UI)${NC}"
echo ""

# Function to kill background processes
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down services...${NC}"
    if [ ! -z "$GO_PID" ]; then
        kill $GO_PID 2>/dev/null
        echo -e "${GREEN}✓ Go API stopped${NC}"
    fi
    if [ ! -z "$UI_PID" ]; then
        kill $UI_PID 2>/dev/null
        echo -e "${GREEN}✓ Vue UI stopped${NC}"
    fi
    exit 0
}

# Set up signal handling
trap cleanup SIGINT SIGTERM

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo -e "${RED}❌ Go is not installed. Please install Go first.${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Start Go API server
echo -e "${BLUE}🔧 Starting Go API server on port 8100...${NC}"
go run main.go &
GO_PID=$!

# Wait a bit for Go server to start
sleep 3

# Check if Go server is running
if ! ps -p $GO_PID > /dev/null; then
    echo -e "${RED}❌ Failed to start Go API server${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Go API server started (PID: $GO_PID)${NC}"

# Install UI dependencies if needed
if [ ! -d "ui/node_modules" ]; then
    echo -e "${BLUE}📦 Installing UI dependencies...${NC}"
    cd ui && npm install && cd ..
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install UI dependencies${NC}"
        kill $GO_PID
        exit 1
    fi
    echo -e "${GREEN}✓ UI dependencies installed${NC}"
fi

# Start Vue UI server
echo -e "${BLUE}🎨 Starting Vue UI server on port 3100...${NC}"
cd ui && npm run dev &
UI_PID=$!
cd ..

# Wait a bit for UI server to start
sleep 3

# Check if UI server is running
if ! ps -p $UI_PID > /dev/null; then
    echo -e "${RED}❌ Failed to start Vue UI server${NC}"
    kill $GO_PID
    exit 1
fi

echo -e "${GREEN}✓ Vue UI server started (PID: $UI_PID)${NC}"
echo ""
echo -e "${GREEN}🎉 Both services are running!${NC}"
echo -e "${BLUE}📡 Go API: http://localhost:8100${NC}"
echo -e "${BLUE}🎨 Vue UI: http://localhost:3100${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both services${NC}"

# Wait for both processes
wait $GO_PID $UI_PID