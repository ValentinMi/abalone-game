FROM node:22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Server image ---
FROM node:22-alpine AS server

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY server/ ./server/
COPY src/types.ts ./src/types.ts
COPY src/constants.ts ./src/constants.ts
COPY src/logic/ ./src/logic/
COPY src/utils/hex.ts ./src/utils/hex.ts
COPY tsconfig.json tsconfig.server.json ./

EXPOSE 3001
CMD ["npx", "tsx", "server/index.ts"]

# --- Nginx image (client) ---
FROM nginx:alpine AS client

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 81
