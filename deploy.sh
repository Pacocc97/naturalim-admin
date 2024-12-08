#!/usr/bin/env bash
set -ex

# Directorio del proyecto
cd "$(dirname "$0")"

# Navegar al directorio productivo
cd .medusa/server

rm -rf node_modules

# Instalar dependencias con pnpm
pnpm install

# Ejecutar migraciones de la base de datos
pnpm run predeploy

# Construir la aplicación
# pnpm build

# Reiniciar la aplicación con pm2
pm2 start "pnpm run start" --name "naturalim-admin"

pm2 restart naturalim-admin

# Opcional: Verificar el estado de pm2
pm2 status
