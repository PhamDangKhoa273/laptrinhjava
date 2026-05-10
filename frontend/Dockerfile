# === Build stage ===
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# === Production stage ===
FROM nginx:1.28-alpine
RUN apk add --no-cache curl

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:80/healthz || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
