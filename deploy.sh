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

# Eliminar procesos detenidos con el nombre 'naturalim-admin'
pm2 delete naturalim-admin --silent || true

# Reiniciar la aplicación existente o iniciar una nueva si no existe
pm2 reload "naturalim-admin" || pm2 start "pnpm run start" --name "naturalim-admin" --update-env

# Verificar el estado de PM2
pm2 status
