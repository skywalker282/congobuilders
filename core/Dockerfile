FROM node:22-bookworm-slim AS build

WORKDIR /opt/app

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build \
    && npm prune --omit=dev \
    && npm cache clean --force

FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=1337

WORKDIR /opt/app

COPY --from=build --chown=node:node /opt/app/ ./
RUN mkdir -p .tmp public/uploads \
    && chown -R node:node .tmp public/uploads

USER node

EXPOSE 1337

CMD ["npm", "run", "start"]
