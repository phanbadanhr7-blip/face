# Multi-stage Dockerfile for Railway / Container Deployment
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency configs
COPY package*.json ./

# Install all dependencies including devDependencies for build
RUN npm ci

# Copy source code
COPY . .

# Build Vite frontend & Esbuild Express server
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package configs and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/firebase-applet-config.json ./

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
