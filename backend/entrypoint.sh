#!/bin/sh
set -e
# Run Prisma migrations (if any)
if [ -f ./node_modules/.bin/prisma ]; then
  echo "Running Prisma migrations..."
  npx prisma migrate deploy
fi
# Start the NestJS application
exec node dist/src/main.js
