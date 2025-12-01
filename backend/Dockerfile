# Backend Dockerfile
FROM node:20-alpine

# Install OpenSSL for SSL certificate generation
RUN apk add --no-cache openssl

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . .

# Generate self-signed SSL certificate if not exists
RUN if [ ! -f cert.pem ] || [ ! -f key.pem ]; then \
      openssl req -x509 -newkey rsa:4096 -nodes \
        -keyout key.pem -out cert.pem -days 365 \
        -subj "/C=VN/ST=HCM/L=HoChiMinh/O=PhoneWorld/CN=localhost"; \
    fi

# Create public directory for uploads
RUN mkdir -p /app/public/images

# Expose port
EXPOSE 3001

# Health check endpoint (with HTTPS)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('https').get('https://localhost:3001/api/health', {rejectUnauthorized: false}, (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Start server
CMD ["node", "server.js"]
