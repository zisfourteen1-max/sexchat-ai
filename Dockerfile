# sexchat-ai — container image (alternative to Render)
# Build:  docker build -t sexchat-ai .
# Run:    docker run -p 3000:3000 --env-file .env sexchat-ai
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY . .
EXPOSE 3000
CMD ["node", "server/server.js"]
