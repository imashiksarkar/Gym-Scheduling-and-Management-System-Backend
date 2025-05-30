# Stage: Install dependencies and generate Prisma client
FROM node:22.16.0-alpine AS deps

WORKDIR /usr/app

COPY package.json pnpm-lock.yaml ./

RUN corepack enable \
  && corepack prepare --activate

RUN pnpm install --ignore-scripts \
  && pnpm approve-builds --yes \
  && pnpm rebuild

COPY prisma ./prisma

RUN pnpm db:generate


# Stage: Remove dev dependencies
FROM deps AS prod-deps

WORKDIR /usr/app

RUN pnpm prune --prod


# Stage: Build the application
FROM deps AS builder

WORKDIR /usr/app

COPY . .

RUN pnpm build


# Stage: Run the application
FROM node:22.16.0-alpine AS runner

RUN corepack enable

WORKDIR /usr/app

COPY --from=prod-deps /usr/app/node_modules ./node_modules
COPY --from=deps /usr/app/package.json ./package.json
COPY --from=builder /usr/app/prisma ./prisma
COPY --from=builder /usr/app/dist ./dist

RUN corepack prepare --activate

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/server.js"]