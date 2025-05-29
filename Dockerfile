FROM node:22.16.0-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install -g pnpm
RUN pnpm install

COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:22.16.0-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./

RUN npm install -g pnpm
RUN pnpm install --prod

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

RUN npx prisma generate

EXPOSE 3000

CMD ["node", "dist/server.js"]
