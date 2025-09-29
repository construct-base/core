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

# Build the application
RUN CGO_ENABLED=1 go build -o /base-api .

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
COPY --from=go-builder /base-api .
RUN chown appuser:appuser /app/base-api
RUN chmod +x /app/base-api

# Copy Vue built frontend
COPY --from=vue-builder /app/vue/dist ./vue/dist

# Copy other necessary files
COPY --from=go-builder /src/logs ./logs
COPY --from=go-builder /src/storage ./storage
COPY --from=go-builder /src/core ./core
COPY --from=go-builder /src/api ./api

# Set ownership
RUN chown -R appuser:appuser /app

# Switch to the non-root user
USER appuser

# Expose port 8100 (standard port for the API)
EXPOSE 8100

# Environment variables
ENV GIN_MODE=release
ENV SERVER_PORT=:8100
ENV STATIC_DIR=/app/vue/dist

ENTRYPOINT [ "./base-api" ]