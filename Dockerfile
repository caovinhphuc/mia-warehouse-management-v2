# =============================================================================
# MIA.vn Google Integration - React Frontend Dockerfile
# =============================================================================

# Multi-stage build for production optimization
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
# Use npm install for better compatibility with package-lock.json variations
RUN npm install --legacy-peer-deps --no-audit

# Copy source code
COPY . .

# Build with Vite (nhẹ hơn Craco - ít RAM, phù hợp Docker)
ENV NODE_OPTIONS="--max-old-space-size=1536"
ENV GENERATE_SOURCEMAP=false
RUN npm run build

# Remove devDependencies after build to reduce image size (optional)
RUN npm prune --production

# Production stage
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built application from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Set permissions (nginx user/group already exist in nginx:alpine)
RUN chown -R nginx:nginx /usr/share/nginx/html && \
  chown -R nginx:nginx /var/cache/nginx && \
  chown -R nginx:nginx /var/log/nginx && \
  chown -R nginx:nginx /etc/nginx/conf.d

# Switch to non-root user
USER nginx

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
