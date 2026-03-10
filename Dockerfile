FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN cd frontend && npm install

# Copy the rest of the app
COPY . .

# Build the web app
RUN cd frontend && npm run build:web

# Serve the built files
EXPOSE 3000
CMD ["npx", "serve", "dist", "-l", "3000"]
