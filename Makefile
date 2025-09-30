.PHONY: help install dev build start clean

help:
	@echo "Construct Framework - Makefile"
	@echo ""
	@echo "Usage:"
	@echo "  make install    Install construct CLI globally"
	@echo "  make dev        Start development servers"
	@echo "  make build      Build production app"
	@echo "  make start      Start production server"
	@echo "  make clean      Clean build artifacts"

install:
	@echo "🔨 Installing construct CLI..."
	@go build -o construct-cli ./cmd/construct/main.go
	@sudo mv construct-cli /usr/local/bin/construct
	@echo "✅ construct CLI installed to /usr/local/bin/construct"
	@echo ""
	@echo "Usage:"
	@echo "  construct dev      # Start development"
	@echo "  construct build    # Build production"
	@echo "  construct start    # Run production"

dev:
	@go run ./cmd/construct/main.go dev

build:
	@go run ./cmd/construct/main.go build

start:
	@go run ./cmd/construct/main.go start

clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -rf public/
	@rm -f construct construct.exe construct-cli
	@echo "✅ Clean complete"