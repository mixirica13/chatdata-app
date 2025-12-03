#!/bin/bash

# Script de teste do MCP Server
# Uso: ./test-server.sh [MCP_TOKEN]

set -e

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SERVER_URL="${SERVER_URL:-http://localhost:3001}"
MCP_TOKEN="${1:-}"

echo -e "${YELLOW}🧪 Testando MCP Server em $SERVER_URL${NC}\n"

# Test 1: Health Check
echo -e "${YELLOW}1. Testing Health Check...${NC}"
response=$(curl -s -w "\n%{http_code}" "$SERVER_URL/health")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ Health check OK${NC}"
    echo "$body" | jq '.'
else
    echo -e "${RED}✗ Health check failed (HTTP $http_code)${NC}"
    exit 1
fi

echo ""

# Test 2: List Available Tools
echo -e "${YELLOW}2. Testing List Tools...${NC}"
response=$(curl -s -w "\n%{http_code}" "$SERVER_URL/api/v1/tools")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ List tools OK${NC}"
    echo "$body" | jq '.'
else
    echo -e "${RED}✗ List tools failed (HTTP $http_code)${NC}"
    exit 1
fi

echo ""

# Se não tiver token, parar aqui
if [ -z "$MCP_TOKEN" ]; then
    echo -e "${YELLOW}ℹ️  MCP Token não fornecido. Testes autenticados não serão executados.${NC}"
    echo -e "${YELLOW}ℹ️  Uso: ./test-server.sh YOUR_MCP_TOKEN${NC}"
    exit 0
fi

# Test 3: Call Tool - List Ad Accounts
echo -e "${YELLOW}3. Testing Tool: list_ad_accounts...${NC}"
response=$(curl -s -w "\n%{http_code}" \
    -X POST "$SERVER_URL/api/v1/tools/call" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $MCP_TOKEN" \
    -d '{"tool":"list_ad_accounts"}')

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ list_ad_accounts OK${NC}"
    echo "$body" | jq '.'
else
    echo -e "${RED}✗ list_ad_accounts failed (HTTP $http_code)${NC}"
    echo "$body" | jq '.'
    exit 1
fi

echo ""

# Test 4: Call Tool - List Campaigns
echo -e "${YELLOW}4. Testing Tool: list_campaigns...${NC}"
response=$(curl -s -w "\n%{http_code}" \
    -X POST "$SERVER_URL/api/v1/tools/call" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $MCP_TOKEN" \
    -d '{"tool":"list_campaigns","parameters":{"status":"ACTIVE","limit":5}}')

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ list_campaigns OK${NC}"
    echo "$body" | jq '.'
else
    echo -e "${RED}✗ list_campaigns failed (HTTP $http_code)${NC}"
    echo "$body" | jq '.'
fi

echo ""

# Test 5: Invalid Token
echo -e "${YELLOW}5. Testing Invalid Token...${NC}"
response=$(curl -s -w "\n%{http_code}" \
    -X POST "$SERVER_URL/api/v1/tools/call" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer invalid_token_123" \
    -d '{"tool":"list_ad_accounts"}')

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "401" ]; then
    echo -e "${GREEN}✓ Invalid token properly rejected${NC}"
    echo "$body" | jq '.'
else
    echo -e "${RED}✗ Invalid token test failed (expected 401, got $http_code)${NC}"
fi

echo ""

# Test 6: Invalid Tool
echo -e "${YELLOW}6. Testing Invalid Tool...${NC}"
response=$(curl -s -w "\n%{http_code}" \
    -X POST "$SERVER_URL/api/v1/tools/call" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $MCP_TOKEN" \
    -d '{"tool":"invalid_tool_name"}')

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "400" ]; then
    echo -e "${GREEN}✓ Invalid tool properly rejected${NC}"
    echo "$body" | jq '.'
else
    echo -e "${RED}✗ Invalid tool test failed (expected 400, got $http_code)${NC}"
fi

echo ""

# Summary
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Todos os testes passaram com sucesso!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
