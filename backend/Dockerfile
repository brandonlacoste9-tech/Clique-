# Clique Backend - 2026 Edition
FROM node:22-alpine

WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++ ffmpeg

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
