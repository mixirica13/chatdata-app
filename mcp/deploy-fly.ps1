# Script de deploy para Fly.io (Windows PowerShell)
# Usage: .\deploy-fly.ps1

Write-Host "🚀 Deploy do MCP Server no Fly.io" -ForegroundColor Cyan
Write-Host ""

# Verificar se fly CLI está instalado
if (-not (Get-Command fly -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Fly CLI não encontrado!" -ForegroundColor Red
    Write-Host "Instale com: iwr https://fly.io/install.ps1 -useb | iex"
    exit 1
}

# Verificar se está logado
try {
    fly auth whoami | Out-Null
} catch {
    Write-Host "🔐 Fazendo login no Fly.io..." -ForegroundColor Yellow
    fly auth login
}

Write-Host "📦 Verificando configuração..." -ForegroundColor Yellow

# Verificar se app já existe
try {
    fly status | Out-Null
    Write-Host "✅ App já existe" -ForegroundColor Green
} catch {
    Write-Host "📝 Criando novo app..." -ForegroundColor Yellow
    fly launch --no-deploy --name chatdata-meta-mcp --region gru
}

Write-Host ""
Write-Host "🏗️  Fazendo deploy..." -ForegroundColor Yellow
fly deploy

Write-Host ""
Write-Host "✅ Deploy concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Informações do servidor:" -ForegroundColor Cyan
fly status

Write-Host ""
Write-Host "🔗 URLs:" -ForegroundColor Cyan
Write-Host "   Health: https://chatdata-meta-mcp.fly.dev/health"
Write-Host "   Info:   https://chatdata-meta-mcp.fly.dev/mcp/info"
Write-Host "   MCP:    https://chatdata-meta-mcp.fly.dev/mcp?token=YOUR_TOKEN"
Write-Host ""
Write-Host "📝 Ver logs: fly logs" -ForegroundColor Yellow
Write-Host "🔍 Abrir dashboard: fly dashboard" -ForegroundColor Yellow
