# Backend Dockerfile (multi-stage optional later)
FROM node:18-alpine AS base

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install --production --no-audit --no-fund || npm install --no-audit --no-fund

# Copy source
COPY . .

ENV NODE_ENV=production
EXPOSE 3000

# Use environment variables for DB and API keys
# DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, PORT, GEMINI_API_KEY, SESSION_SECRET

CMD ["node", "server.js"]
