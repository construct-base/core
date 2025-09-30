# Construct Deployment Guide

## Architecture

Construct is a **single-binary full-stack application**:
- Go binary serves both Vue SPA (from `public/`) and API (from `/api`)
- No separate web server needed (nginx optional for advanced setups)
- One process serves everything

## Development vs Production

### Development (Two Processes)
```bash
# Using Construct CLI (recommended)
construct dev

# OR manually:
# Terminal 1: Go API (port 8100)
go run main.go

# Terminal 2: Vue dev server (port 3100, proxies /api to Go)
cd vue && bun run dev
```

### Production (Single Process)
```bash
# Using Construct CLI (recommended)
construct build    # Build Vue SPA + Go binary
construct start    # Run production server

# OR manually:
# 1. Build Vue SPA → outputs to public/
cd vue && bun run build

# 2. Build Go binary
cd .. && go build -o construct main.go

# 3. Run single binary (serves both Vue + API)
./construct

# Access app at http://localhost:8100
```

## How It Works

### Request Routing

```
Browser Request
     ↓
Go Server (port 8100)
     ↓
  ┌──────────────────────┐
  │ Is path /api/* ?     │───Yes──→ API Handler (Go modules)
  └──────────────────────┘
     ↓ No
  ┌──────────────────────┐
  │ Is path /storage/* ? │───Yes──→ Storage Handler (files)
  └──────────────────────┘
     ↓ No
  ┌──────────────────────┐
  │ Does file exist in   │───Yes──→ Serve file (JS, CSS, images)
  │ public/ directory?   │
  └──────────────────────┘
     ↓ No
  ┌──────────────────────┐
  │ Serve public/index.html │────→ Vue Router takes over
  └──────────────────────┘
```

### Example Requests

| Request | Go Handler | Result |
|---------|-----------|--------|
| `GET /` | SPA | Serves `public/index.html` |
| `GET /users` | SPA | Serves `public/index.html` (Vue Router → `/users`) |
| `GET /assets/index.js` | SPA | Serves `public/assets/index.js` |
| `GET /api/users` | API | JSON response from Go |
| `GET /storage/avatar.jpg` | Storage | Serves file from `storage/` |

## Production Deployment

### Option 1: Direct (Single Binary)

**Simplest setup** - Go serves everything:

```bash
# Build using CLI
construct build

# Run
PORT=80 ./construct

# OR manually
cd vue && bun run build
cd .. && go build -o construct main.go
PORT=80 ./construct
```

**Pros:**
- Simple, one process
- No nginx needed
- Perfect for Docker/VPS

**Cons:**
- Less control over caching headers
- No load balancing

### Option 2: Nginx Reverse Proxy

**Production-grade setup** - Nginx serves static files, proxies API to Go:

```nginx
server {
    listen 80;
    server_name example.com;

    root /var/www/construct/public;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy to Go
    location /api/ {
        proxy_pass http://localhost:8100;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Storage proxy to Go
    location /storage/ {
        proxy_pass http://localhost:8100;
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Pros:**
- Better caching control
- Load balancing ready
- SSL termination

**Cons:**
- Two processes to manage
- More complex setup

### Option 3: Docker

```dockerfile
# Multi-stage build
FROM node:20 AS frontend
WORKDIR /app/vue
COPY vue/package.json vue/bun.lockb ./
RUN npm install -g bun && bun install
COPY vue/ ./
RUN bun run build

FROM golang:1.23 AS backend
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
COPY --from=frontend /app/public ./public
RUN go build -o construct main.go

FROM debian:bookworm-slim
WORKDIR /app
COPY --from=backend /app/construct .
COPY --from=backend /app/.env.example .env
EXPOSE 8100
CMD ["./construct"]
```

```bash
# Build
docker build -t construct .

# Run
docker run -p 8100:8100 construct
```

## Environment Variables

### Required
```bash
# Database
DB_DRIVER=sqlite
DB_NAME=construct.db

# JWT
JWT_SECRET=your-secret-key-here
```

### Optional
```bash
# Server
PORT=8100
HOST=0.0.0.0

# CORS (if needed)
CORS_ENABLED=true
CORS_ALLOWED_ORIGINS=http://localhost:3100

# Email (optional)
MAIL_DRIVER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-password

# Storage (optional)
STORAGE_DRIVER=local
STORAGE_PATH=./storage
```

## Performance Tips

### 1. Build Optimization
```bash
# Production build with optimizations
cd vue && NODE_ENV=production bun run build
```

### 2. Caching Strategy
- Static assets (JS/CSS): Cache 1 year (`immutable`)
- API responses: No cache (dynamic)
- HTML: No cache (for SPA updates)

### 3. Gzip Compression
Enabled automatically in nginx or can be added to Go.

### 4. Database
- Use PostgreSQL in production (instead of SQLite)
- Enable connection pooling
- Add database indices

## Monitoring

### Health Check
```bash
curl http://localhost:8100/health
```

### Logs
Go uses structured logging:
```bash
# View logs
./construct 2>&1 | tee app.log

# JSON logs for parsing
LOG_FORMAT=json ./construct
```

## Security

### 1. Environment Variables
Never commit `.env` - use `.env.example` as template.

### 2. CORS
Only enable in dev or specific origins:
```bash
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

### 3. JWT Secret
Generate strong secret:
```bash
openssl rand -base64 32
```

### 4. HTTPS
Always use HTTPS in production (nginx or Caddy).

## Troubleshooting

### Vue app shows "Cannot connect to API"
- Check `VITE_API_URL` in build
- Ensure Go is running
- Check CORS settings

### 404 on refresh (SPA routes)
- Ensure `setupSPARoutes()` is called in `main.go`
- Check that `public/index.html` exists

### Assets not loading
- Verify build output in `public/`
- Check file paths in browser DevTools

## Summary

**Development:**
```bash
construct dev  # Runs both Go + Vue with hot reload
```

**Production:**
```bash
construct build  # Build Vue SPA + Go binary
construct start  # Run production server
# OR
./construct     # Direct binary
```

One command, one process, one port. That's Construct! 🚀