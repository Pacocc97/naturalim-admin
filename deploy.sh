#!/usr/bin/env bash
set -ex

# Directorio del proyecto
cd "$(dirname "$0")"

# Navegar al directorio productivo
cd .medusa/server

# Instalar dependencias con pnpm
pnpm install

# Ejecutar migraciones de la base de datos
pnpm run predeploy

# Construir la aplicación
# pnpm build

# Reiniciar la aplicación con pm2
pm2 restart medusa-app || pm2 start "pnpm run start" --name "medusa-app"

# Opcional: Verificar el estado de pm2
pm2 status
