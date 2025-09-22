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
RUN npm run build

FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist ./

# Provide default nginx config
COPY darknet-duel-frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


