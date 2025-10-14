#!/bin/bash

echo "🚀 Iniciando MCP Trends (SIN Claude Desktop)"
echo "============================================="

# Verificar si el backend está corriendo
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Backend ya está corriendo en puerto 3001"
else
    echo "🔄 Iniciando backend en puerto 3001..."
    cd apps/backend-api
    PORT=3001 npm run dev &
    sleep 3
    echo "✅ Backend iniciado"
    cd ../..
fi

echo ""
echo "🔍 Iniciando MCP Inspector..."
echo "Esto abrirá una interfaz web para probar todas las herramientas MCP"
echo ""

cd mcp
npx @modelcontextprotocol/inspector npx tsx trends-server.ts