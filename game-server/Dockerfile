FROM node:20-alpine AS base
WORKDIR /app
COPY game-server/package*.json ./
# Harden npm for flaky networks
ENV npm_config_loglevel=warn \
    npm_config_fetch_retries=5 \
    npm_config_fetch_retry_mintimeout=20000 \
    npm_config_fetch_retry_maxtimeout=120000 \
    npm_config_fetch_timeout=600000
RUN npm ci --omit=dev --no-audit --no-fund

FROM node:20-alpine AS build
WORKDIR /app
COPY game-server/package*.json ./
# Harden npm for flaky networks
ENV npm_config_loglevel=warn \
    npm_config_fetch_retries=5 \
    npm_config_fetch_retry_mintimeout=20000 \
    npm_config_fetch_retry_maxtimeout=120000 \
    npm_config_fetch_timeout=600000
RUN npm ci --no-audit --no-fund
COPY game-server/tsconfig.json ./
COPY game-server/src ./src
COPY shared-types ./shared-types
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV GAME_SERVER_HOST=0.0.0.0
ENV GAME_SERVER_PORT=8001

COPY --from=base /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY game-server/package*.json ./

EXPOSE 8001

CMD ["node", "dist/server.js"]


