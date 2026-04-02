FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

COPY package.json ./
COPY pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/client/package.json ./packages/client/package.json

RUN pnpm install --no-frozen-lockfile

COPY packages/shared/ ./packages/shared/
COPY packages/client/ ./packages/client/

WORKDIR /app/packages/client

EXPOSE 5173 6006

CMD ["pnpm", "dev"]
