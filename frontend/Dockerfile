# Frontend Dockerfile - Multi-stage build
# Stage 1: Build the React app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build arguments for environment variables
ARG REACT_APP_API_URL
ARG REACT_APP_GOOGLE_CLIENT_ID
ARG REACT_APP_FACEBOOK_APP_ID
ARG VITE_API_BASE

# Set environment variables for build
ENV REACT_APP_API_URL=${REACT_APP_API_URL:-http://localhost:3001}
ENV REACT_APP_GOOGLE_CLIENT_ID=${REACT_APP_GOOGLE_CLIENT_ID}
ENV REACT_APP_FACEBOOK_APP_ID=${REACT_APP_FACEBOOK_APP_ID}
ENV VITE_API_BASE=${VITE_API_BASE:-http://localhost:3001}

# Build the app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Install OpenSSL for generating certificates
RUN apk add --no-cache openssl

# Copy built files from builder stage (react-scripts builds to 'build' folder)
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create SSL directory and generate self-signed SSL certificate
RUN mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -newkey rsa:4096 -nodes \
    -keyout /etc/nginx/ssl/nginx.key \
    -out /etc/nginx/ssl/nginx.crt \
    -days 365 \
    -subj "/C=VN/ST=HCM/L=HoChiMinh/O=PhoneWorld/CN=localhost"

# Expose ports 80 and 443
EXPOSE 80 443

# Health check - test HTTPS endpoint
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider --no-check-certificate https://localhost:443/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
