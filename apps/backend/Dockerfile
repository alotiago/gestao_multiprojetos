# Dockerfile - Backend (NestJS)

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package.json's
COPY package*.json ./
COPY apps/backend/package*.json apps/backend/

# Instalar dependências
RUN npm install

# Copiar código
COPY . .

# Build
WORKDIR /app/apps/backend
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copiar package.json's
COPY package*.json ./
COPY apps/backend/package*.json apps/backend/
COPY apps/backend/prisma apps/backend/prisma/

# Instalar apenas dependências de produção
RUN apk add --no-cache openssl && npm install --production && npx prisma generate --schema=apps/backend/prisma/schema.prisma

# Copiar build do backend
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "const req=require('http').get('http://127.0.0.1:3001/health',(res)=>{process.exit(res.statusCode===200?0:1)});req.on('error',()=>process.exit(1));"

# Expor porta
EXPOSE 3001

# Comando de inicialização
CMD ["node", "apps/backend/dist/main.js"]
