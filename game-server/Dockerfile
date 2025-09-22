FROM node:20-alpine AS base
WORKDIR /app
COPY game-server/package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS build
WORKDIR /app
COPY game-server/package*.json ./
RUN npm ci
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


