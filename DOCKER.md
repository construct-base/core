# Docker Deployment Guide

## Overview

Construct provides production-ready Docker support with:
- Multi-stage build (Vue + Go)
- Minimal Alpine-based image (~20MB)
- Health checks
- CapRover support
- Docker Compose for local testing

## Quick Start

### Build and Run

```bash
# Build image
docker build -t construct:latest .

# Run container
docker run -p 8100:8100 \
  -e JWT_SECRET=your-secret \
  -e DB_DRIVER=sqlite \
  construct:latest
```

### Using Docker Compose

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Dockerfile Stages

### Stage 1: Frontend Build
```dockerfile
FROM node:20-alpine AS frontend
# Builds Vue SPA using bun
# Outputs to /app/public
```

### Stage 2: Backend Build
```dockerfile
FROM golang:1.23-alpine AS backend
# Compiles Go binary
# Copies Vue app from Stage 1
```

### Stage 3: Production Image
```dockerfile
FROM alpine:latest
# Minimal runtime image
# Only binary + public/ directory
# ~20MB total
```

## Environment Variables

```bash
# Required
JWT_SECRET=your-jwt-secret-key

# Optional
PORT=8100
DB_DRIVER=sqlite
DB_NAME=/data/construct.db
CORS_ENABLED=false
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# Email (optional)
MAIL_DRIVER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-password

# Storage (optional)
STORAGE_DRIVER=local
STORAGE_PATH=/root/storage
```

## CapRover Deployment

CapRover is a self-hosted PaaS that makes deployment simple.

### Prerequisites

1. **CapRover server running**
2. **CapRover CLI installed**
   ```bash
   npm install -g caprover
   ```

### Deploy Steps

#### 1. Initialize App

```bash
# One-time setup
caprover login

# Create app (or use CapRover UI)
caprover apps create construct
```

#### 2. Set Environment Variables

In CapRover UI → Your App → App Configs → Environment Variables:

```env
JWT_SECRET=your-secret-key-here
DB_DRIVER=sqlite
DB_NAME=/data/construct.db
PORT=80
```

#### 3. Deploy

```bash
# From project root
caprover deploy

# Or specify app name
caprover deploy -a construct
```

#### 4. Enable HTTPS

In CapRover UI:
1. Go to your app
2. Enable "HTTPS"
3. Click "Enable HTTPS" and "Force HTTPS"

#### 5. Persistent Storage (Optional)

For database and uploaded files:

In CapRover UI → Your App → App Configs → Persistent Directories:
```
/data          # For SQLite database
/root/storage  # For uploaded files
```

### Deploy Script

Create `deploy.sh`:

```bash
#!/bin/bash

echo "🚀 Deploying Construct to CapRover..."

# Ensure we're on main/master
git checkout main

# Deploy
caprover deploy -a construct

echo "✅ Deployment complete!"
echo "🌐 Visit: https://construct.yourdomain.com"
```

Make executable:
```bash
chmod +x deploy.sh
./deploy.sh
```

## Docker Hub

### Build and Push

```bash
# Build for multiple platforms
docker buildx create --use
docker buildx build --platform linux/amd64,linux/arm64 \
  -t yourusername/construct:latest \
  -t yourusername/construct:1.0.0 \
  --push .
```

### Pull and Run

```bash
docker pull yourusername/construct:latest
docker run -p 8100:8100 \
  -e JWT_SECRET=secret \
  yourusername/construct:latest
```

## Production Checklist

### Before Deploying

- [ ] Set strong `JWT_SECRET`
- [ ] Configure database (PostgreSQL recommended for prod)
- [ ] Set up persistent volumes
- [ ] Configure CORS if needed
- [ ] Set up email provider
- [ ] Enable HTTPS
- [ ] Set up backups

### After Deploying

- [ ] Test health endpoint: `curl https://yourapp.com/health`
- [ ] Test API: `curl https://yourapp.com/api/health`
- [ ] Test Vue app loads
- [ ] Test authentication flow
- [ ] Monitor logs

## Docker Compose Production

For VPS deployment without CapRover:

```yaml
version: '3.8'

services:
  construct:
    image: yourusername/construct:latest
    ports:
      - "80:8100"
    environment:
      - PORT=8100
      - DB_DRIVER=postgres
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=construct
      - DB_USER=construct
      - DB_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - ./storage:/root/storage
    restart: unless-stopped
    depends_on:
      - postgres

  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=construct
      - POSTGRES_USER=construct
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - construct
    restart: unless-stopped

volumes:
  postgres-data:
```

## Monitoring

### Health Check

```bash
# Container health
docker ps

# Application health
curl http://localhost:8100/health
```

### Logs

```bash
# View logs
docker logs -f container-name

# Last 100 lines
docker logs --tail 100 container-name

# Docker Compose
docker-compose logs -f construct
```

### Resource Usage

```bash
# Container stats
docker stats container-name

# Disk usage
docker system df
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker logs container-name

# Inspect container
docker inspect container-name

# Check environment
docker exec container-name env
```

### Build fails

```bash
# Clean build
docker build --no-cache -t construct:latest .

# Check each stage
docker build --target frontend -t construct:frontend .
docker build --target backend -t construct:backend .
```

### Port already in use

```bash
# Find process
lsof -i :8100

# Use different port
docker run -p 8200:8100 construct:latest
```

### Database connection issues

```bash
# Check network
docker network ls
docker network inspect bridge

# Test connectivity
docker exec container-name ping postgres
```

## Performance

### Image Size

```bash
# Check size
docker images construct:latest

# Expected: ~20MB (Alpine base)
```

### Build Time

- Frontend: ~2-3 minutes
- Backend: ~1-2 minutes
- Total: ~3-5 minutes

### Optimize Build

```bash
# Use build cache
docker build -t construct:latest .

# Multi-stage caching
docker buildx build --cache-from type=registry,ref=construct:cache .
```

## Security

### Best Practices

1. **Secrets Management**
   ```bash
   # Use Docker secrets
   echo "your-secret" | docker secret create jwt_secret -
   ```

2. **Non-root User**
   ```dockerfile
   # Add to Dockerfile
   RUN adduser -D -u 1000 appuser
   USER appuser
   ```

3. **Read-only Filesystem**
   ```bash
   docker run --read-only construct:latest
   ```

4. **Security Scanning**
   ```bash
   docker scan construct:latest
   ```

## Summary

Construct provides a **complete Docker solution**:

✅ **Multi-stage build** - Optimized for size
✅ **CapRover ready** - One-command deployment
✅ **Docker Compose** - Local dev and production
✅ **Health checks** - Built-in monitoring
✅ **Alpine-based** - Minimal attack surface

**Deploy anywhere Docker runs!** 🚀