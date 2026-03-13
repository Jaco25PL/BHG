FROM node:20-alpine AS builder

WORKDIR /app

# Install deps first — cached until package.json changes
COPY package*.json ./
RUN npm install

# NEXT_PUBLIC_* vars must be present at build time
ARG NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

COPY . .
RUN npm run build

# ── Runtime image ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# standalone output contains only what's needed to run
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
