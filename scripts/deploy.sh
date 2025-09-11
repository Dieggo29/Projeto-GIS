#!/bin/bash

echo "🚀 Iniciando deploy..."

# Build e start dos containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d

echo "✅ Deploy concluído!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:3001"
echo "Nginx: http://localhost:80"