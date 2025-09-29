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

# Function to kill existing processes on ports 8100 and 3100
kill_existing_processes() {
    echo -e "${YELLOW}🧹 Cleaning up existing processes...${NC}"

    # Kill processes on port 8100 (Go API)
    if lsof -ti:8100 >/dev/null 2>&1; then
        echo -e "${YELLOW}   Killing processes on port 8100...${NC}"
        lsof -ti:8100 | xargs kill -9 2>/dev/null || true
    fi

    # Kill processes on port 3100 (Vue UI)
    if lsof -ti:3100 >/dev/null 2>&1; then
        echo -e "${YELLOW}   Killing processes on port 3100...${NC}"
        lsof -ti:3100 | xargs kill -9 2>/dev/null || true
    fi

    # Kill any remaining Go or Bun dev processes
    pkill -f "go run main.go\|bun.*dev" 2>/dev/null || true

    # Wait a moment for processes to clean up
    sleep 1

    echo -e "${GREEN}✓ Cleanup completed${NC}"
}

# Clean up existing processes first
kill_existing_processes

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo -e "${RED}❌ Go is not installed. Please install Go first.${NC}"
    exit 1
fi

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    echo -e "${RED}❌ Bun is not installed. Please install Bun first.${NC}"
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

# Install Vue dependencies if needed
if [ ! -d "vue/node_modules" ]; then
    echo -e "${BLUE}📦 Installing Vue dependencies...${NC}"
    cd vue && bun install && cd ..
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install Vue dependencies${NC}"
        kill $GO_PID
        exit 1
    fi
    echo -e "${GREEN}✓ Vue dependencies installed${NC}"
fi

# Start Vue UI server
echo -e "${BLUE}🎨 Starting Vue UI server on port 3100...${NC}"
cd vue && bun run dev --port 3100 &
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