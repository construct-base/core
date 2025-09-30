# syntax=docker/dockerfile:1

# Stage 1: Build Vue frontend with Bun
FROM oven/bun:1 AS vue-builder

WORKDIR /app/vue

# Copy Vue project files
COPY vue/package.json vue/bun.lockb* ./
RUN bun install

# Copy Vue source code and build
COPY vue/ ./
RUN bun run build

# Stage 2: Build Go backend
ARG GO_VERSION=1.23.0
FROM golang:${GO_VERSION}-bullseye AS go-builder
WORKDIR /src

# Copy the Go modules files first and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of your application code
COPY . .

# Build the application to dist/
RUN CGO_ENABLED=1 go build -o /dist/construct main.go

# Stage 3: Final runtime image
FROM debian:bookworm-slim AS final
WORKDIR /app

# Install certificates and time zone data
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    tzdata \
    && rm -rf /var/lib/apt/lists/*

ARG UID=10001
RUN useradd -r -u ${UID} appuser

# Copy the Go binary and set permissions
COPY --from=go-builder /dist/construct .
RUN chmod +x /app/construct

# Copy Vue built frontend from dist/public
COPY --from=vue-builder /app/dist/public ./public

# Copy .env.example as template (users can override with volume mount)
COPY .env.example ./.env.example

# Create necessary directories
RUN mkdir -p logs storage && \
    chown -R appuser:appuser /app

# Switch to the non-root user
USER appuser

# Expose port 8100 (standard port for the API)
EXPOSE 8100

# Environment variables (can be overridden in CapRover or docker-compose)
ENV SERVER_PORT=:8100

ENTRYPOINT [ "./construct" ]