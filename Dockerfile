# Etapa 1: Builder
FROM node:lts AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Configurar el directorio global de pnpm a /usr/local/bin
RUN pnpm config set global-bin-dir /usr/local/bin

# Instalar @medusajs/cli globalmente
RUN pnpm add -g @medusajs/cli@2.0.7

# Copiar archivos de configuración
COPY package.json pnpm-lock.yaml tsconfig.json ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar el resto de la aplicación
COPY . .

# Construir la aplicación
RUN pnpm build

# Debug: Verificar contenido después de la construcción
RUN echo "Contents of /app after build:" && ls -R /app

# Etapa 2: Producción
FROM node:lts-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Configurar el directorio global de pnpm a /usr/local/bin
RUN pnpm config set global-bin-dir /usr/local/bin

# Instalar @medusajs/cli globalmente
RUN pnpm add -g @medusajs/cli@2.0.7

# Copiar archivos de configuración
COPY package.json pnpm-lock.yaml tsconfig.json ./

# Instalar dependencias de producción
RUN pnpm install --frozen-lockfile --prod

# Copiar el build de la etapa builder
COPY --from=builder /app/.medusa ./medusa
COPY --from=builder /app/. .

# Debug: Verificar contenido después de copiar el build
RUN echo "Contents of /app after copying from builder:" && ls -R /app

# Establecer el directorio de trabajo para el servidor
WORKDIR /app/.medusa/server

# Exponer el puerto
EXPOSE 9000

# Definir el comando por defecto para ejecutar predeploy y start
# CMD ["sh", "-c", "if [ -d /app/.medusa/server ]; then cd /app/.medusa/server && pnpm run predeploy; else echo 'Directory /app/.medusa/server not found'; fi"]
CMD ["sh", "-c", "cd /app/.medusa/server && pnpm run predeploy"]
