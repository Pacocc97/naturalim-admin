#!/usr/bin/env bash
set -ex

# Directorio del proyecto
cd "$(dirname "$0")"

# Navegar al directorio productivo
cd .medusa/server

# Eliminar node_modules para asegurar una instalación limpia
rm -rf node_modules

# Instalar dependencias con pnpm
pnpm install

# Ejecutar migraciones de la base de datos
pnpm run predeploy

# (Opcional) Construir la aplicación si es necesario
# pnpm build

# Iniciar o reiniciar la aplicación con PM2
pm2 start "pnpm run start" --name "naturalim-admin" --update-env || pm2 restart "naturalim-admin"

# Verificar el estado de PM2
pm2 status
