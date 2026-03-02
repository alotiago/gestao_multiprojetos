# Dockerfile - Frontend (Next.js)

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package.json's
COPY package*.json ./
COPY apps/frontend/package*.json apps/frontend/

# Instalar dependências
RUN npm install

# Copiar código
COPY . .

# Build Next.js
WORKDIR /app/apps/frontend
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copiar package.json's
COPY package*.json ./
COPY apps/frontend/package*.json apps/frontend/

# Instalar apenas dependências de produção
RUN npm install --production

# Copiar build do frontend
COPY --from=builder /app/apps/frontend/.next ./apps/frontend/.next
COPY --from=builder /app/apps/frontend/next.config.js ./apps/frontend/

# Expor porta
EXPOSE 3000

# Comando de inicialização
CMD ["npm", "-w", "apps/frontend", "run", "start"]
