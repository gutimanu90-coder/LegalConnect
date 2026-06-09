#!/usr/bin/env bash
# Build and start the production server with auto-restart
set -e

echo "Building..."
npm run build --silent

echo "Starting server..."
while true; do
  NODE_ENV=production node dist/index.js
  echo "Server exited, restarting in 3s..."
  sleep 3
done
