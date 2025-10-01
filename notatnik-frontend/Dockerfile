# Frontend Dockerfile (multi-stage: build + static serve)
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build

# Serve with a lightweight static server
FROM nginx:1.27-alpine AS prod
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist .
# Basic nginx config could be added here if needed
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
