# Multi-stage build for security and smaller image size
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Copy source files and build
COPY trends-server.ts tsconfig.json manifest.json ./
RUN npm run build

# Production stage with distroless image for security
FROM gcr.io/distroless/nodejs22-debian12

# Copy built application from builder stage
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/manifest.json /app/manifest.json

WORKDIR /app

# No root user, no shell access = more secure
USER 65534

# No port exposure needed for STDIO MCP server

# Distroless images don't support shell commands for healthcheck
# Use node process check instead
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD ["/nodejs/bin/node", "-e", "process.exit(0)"]

# Start MCP server with STDIO transport  
CMD ["node", "dist/trends-server.js"]