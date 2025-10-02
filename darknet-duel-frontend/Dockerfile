FROM node:20-alpine AS build
WORKDIR /app
COPY darknet-duel-frontend/package*.json ./
ENV npm_config_loglevel=warn \
    npm_config_fetch_retries=5 \
    npm_config_fetch_retry_mintimeout=20000 \
    npm_config_fetch_retry_maxtimeout=120000 \
    npm_config_fetch_timeout=600000
RUN npm ci --no-audit --no-fund
COPY darknet-duel-frontend/. .
# Ensure shared-types are present for Vite alias
COPY shared-types ./shared-types

# Inject Vite env at build time
ARG VITE_API_URL
ARG VITE_GAME_SERVER_URL
ARG VITE_BUILD_ENV
ARG VITE_COMMIT_SHA
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_GAME_SERVER_URL=${VITE_GAME_SERVER_URL}
ENV VITE_BUILD_ENV=${VITE_BUILD_ENV}
ENV VITE_COMMIT_SHA=${VITE_COMMIT_SHA}
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=build /app/dist ./dist
RUN npm i -g serve@14
EXPOSE 80
CMD ["sh", "-lc", "serve dist -s -l 80"]


