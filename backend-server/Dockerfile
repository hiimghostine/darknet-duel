FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
# Harden npm for flaky networks
ENV npm_config_loglevel=warn \
    npm_config_fetch_retries=5 \
    npm_config_fetch_retry_mintimeout=20000 \
    npm_config_fetch_retry_maxtimeout=120000 \
    npm_config_fetch_timeout=600000
RUN npm ci --omit=dev --no-audit --no-fund

FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
ENV npm_config_loglevel=warn \
    npm_config_fetch_retries=5 \
    npm_config_fetch_retry_mintimeout=20000 \
    npm_config_fetch_retry_maxtimeout=120000 \
    npm_config_fetch_timeout=600000
RUN npm ci --no-audit --no-fund
COPY tsconfig.json ./
COPY src ./src
COPY assets ./assets
COPY files ./files
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8000

# Copy production deps and built files
COPY --from=base /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY assets ./assets
COPY files ./files
COPY package*.json ./

EXPOSE 8000

CMD ["node", "dist/index.js"]


