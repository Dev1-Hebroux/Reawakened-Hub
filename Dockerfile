# Dockerfile for Fly.io deployment
FROM node:20-slim AS base

# Install dependencies for native modules (bcrypt)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --include=dev

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-slim AS production

WORKDIR /app

# Install runtime dependencies for bcrypt
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files and install all dependencies (including drizzle-kit for migrations)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy built files and source needed for migrations
COPY --from=base /app/dist ./dist
COPY --from=base /app/attached_assets ./attached_assets
COPY drizzle.config.ts ./
COPY shared ./shared

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Start the server
CMD ["node", "dist/index.mjs"]
