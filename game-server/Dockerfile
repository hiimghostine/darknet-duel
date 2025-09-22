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
RUN npm run build || true

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV GAME_SERVER_HOST=0.0.0.0
ENV GAME_SERVER_PORT=8001
ENV TS_NODE_TRANSPILE_ONLY=1
ENV TS_NODE_COMPILER_OPTIONS='{"module":"commonjs","moduleResolution":"node"}'

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/src ./src
COPY --from=build /app/shared-types ./shared-types
COPY game-server/package*.json ./

EXPOSE 8001

# Run via ts-node (transpile-only) if dist is missing, otherwise run built JS
CMD ["sh", "-lc", "if [ -f dist/server/index.js ]; then node dist/server/index.js; else node -r ts-node/register/transpile-only src/server/index.ts; fi"]


