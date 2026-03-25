FROM node:18-alpine AS builder

WORKDIR /app

# Install OpenSSL 1.1.x (Prisma requirement)
RUN apk add --no-cache openssl1.1-compat libc6-compat

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate
COPY . .
RUN npm run build

# ---- Production stage ----
FROM node:18-alpine

WORKDIR /app

# Install OpenSSL 1.1.x in production
RUN apk add --no-cache openssl1.1-compat libc6-compat

RUN mkdir -p logs && chmod 755 logs

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000

CMD ["npm", "start"]