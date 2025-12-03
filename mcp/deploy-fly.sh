#!/bin/bash

# Script de deploy para Fly.io
# Usage: ./deploy-fly.sh

set -e

echo "🚀 Deploy do MCP Server no Fly.io"
echo ""

# Verificar se fly CLI está instalado
if ! command -v fly &> /dev/null; then
    echo "❌ Fly CLI não encontrado!"
    echo "Instale com: curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Verificar se está logado
if ! fly auth whoami &> /dev/null; then
    echo "🔐 Fazendo login no Fly.io..."
    fly auth login
fi

echo "📦 Verificando configuração..."

# Verificar se app já existe
if ! fly status &> /dev/null; then
    echo "📝 Criando novo app..."
    fly launch --no-deploy --name chatdata-meta-mcp --region gru
else
    echo "✅ App já existe"
fi

echo ""
echo "🏗️  Fazendo deploy..."
fly deploy

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "📊 Informações do servidor:"
fly status

echo ""
echo "🔗 URLs:"
echo "   Health: https://chatdata-meta-mcp.fly.dev/health"
echo "   Info:   https://chatdata-meta-mcp.fly.dev/mcp/info"
echo "   MCP:    https://chatdata-meta-mcp.fly.dev/mcp?token=YOUR_TOKEN"
echo ""
echo "📝 Ver logs: fly logs"
echo "🔍 Abrir dashboard: fly dashboard"
