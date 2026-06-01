# ---- Build Stage ----
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and lock files
COPY package.json .
COPY tsconfig.json .
COPY tsconfig.build.json .
COPY prisma ./prisma
COPY src ./src
COPY entrypoint.sh ./entrypoint.sh

# Install dependencies (including dev for build)
RUN npm ci

# Generate Prisma client
RUN npm run prisma:generate

# Build the TypeScript source
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS runtime

WORKDIR /app

# Copy only needed files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
# Copy entrypoint script and set executable
COPY --from=builder /app/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Expose the port (default 4000, can be overridden)
EXPOSE 4000

# Set environment to production
ENV NODE_ENV=production

# Use entrypoint to run migrations then start app
ENTRYPOINT ["./entrypoint.sh"]
