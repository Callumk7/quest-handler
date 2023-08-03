FROM node:18 AS base

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install

COPY . .

RUN pnpm build

EXPOSE 3100
CMD [ "pnpm", "start" ]
