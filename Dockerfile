FROM node:lts-bookworm-slim

WORKDIR /app

RUN npm install -g pnpm
RUN npm install -g serve

COPY package*.json ./
RUN pnpm install

COPY . .

RUN pnpm run build
CMD ["serve", "-p", "80", "dist"]
