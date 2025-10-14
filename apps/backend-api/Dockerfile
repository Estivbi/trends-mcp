# Multi-stage build for security and smaller image size
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code and build
COPY src/ ./src/
COPY tsconfig.json ./
RUN npm run build

# Production stage with distroless image for security
FROM gcr.io/distroless/nodejs22-debian12

# Copy built application from builder stage
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json

WORKDIR /app

# No root user, no shell access = more secure
USER 65534

# Expose port (actualizado al puerto 3001)
EXPOSE 3001

# Health check - Simple HTTP check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD ["/nodejs/bin/node", "-e", "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"]

# Start the application
CMD ["node", "dist/server.js"]