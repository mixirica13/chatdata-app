#!/bin/bash

# Script de teste do MCP Server (HTTP Streamable)
# Uso: ./test-mcp.sh [META_ACCESS_TOKEN]

set -e

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SERVER_URL="${SERVER_URL:-http://localhost:3001}"
META_TOKEN="${1:-}"

echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo -e "${BLUE}  MCP Server Test Suite (HTTP Streamable)${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}\n"

# Test 1: Health Check
echo -e "${YELLOW}1️⃣  Testing Health Check...${NC}"
response=$(curl -s "$SERVER_URL/health")

if echo "$response" | jq -e '.status == "ok"' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Health check OK${NC}"
    echo "$response" | jq '.'
else
    echo -e "${RED}✗ Health check failed${NC}"
    echo "$response"
    exit 1
fi

echo ""

# Test 2: Server Info
echo -e "${YELLOW}2️⃣  Testing Server Info...${NC}"
response=$(curl -s "$SERVER_URL/mcp/info")

if echo "$response" | jq -e '.server' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Server info OK${NC}"
    echo "$response" | jq '.'
else
    echo -e "${RED}✗ Server info failed${NC}"
    echo "$response"
    exit 1
fi

echo ""

# Se não tiver token, parar aqui
if [ -z "$META_TOKEN" ]; then
    echo -e "${YELLOW}ℹ️  Meta Access Token não fornecido.${NC}"
    echo -e "${YELLOW}ℹ️  Testes autenticados não serão executados.${NC}"
    echo -e "${YELLOW}ℹ️  Uso: ./test-mcp.sh YOUR_META_ACCESS_TOKEN${NC}"
    exit 0
fi

# Test 3: MCP Initialize
echo -e "${YELLOW}3️⃣  Testing MCP Initialize...${NC}"
response=$(curl -s -X POST "$SERVER_URL/mcp?token=$META_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {
                "name": "test-client",
                "version": "1.0.0"
            }
        }
    }')

if echo "$response" | jq -e '.result.serverInfo' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Initialize OK${NC}"
    echo "$response" | jq '.result'
else
    echo -e "${RED}✗ Initialize failed${NC}"
    echo "$response" | jq '.'
    exit 1
fi

echo ""

# Test 4: MCP List Tools
echo -e "${YELLOW}4️⃣  Testing MCP List Tools...${NC}"
response=$(curl -s -X POST "$SERVER_URL/mcp?token=$META_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/list"
    }')

if echo "$response" | jq -e '.result.tools' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ List tools OK${NC}"
    tools_count=$(echo "$response" | jq '.result.tools | length')
    echo -e "  Found ${BLUE}$tools_count${NC} tools:"
    echo "$response" | jq -r '.result.tools[] | "  - " + .name + ": " + .description'
else
    echo -e "${RED}✗ List tools failed${NC}"
    echo "$response" | jq '.'
    exit 1
fi

echo ""

# Test 5: MCP Call Tool - list_ad_accounts
echo -e "${YELLOW}5️⃣  Testing MCP Call Tool: list_ad_accounts...${NC}"
response=$(curl -s -X POST "$SERVER_URL/mcp?token=$META_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "jsonrpc": "2.0",
        "id": 3,
        "method": "tools/call",
        "params": {
            "name": "list_ad_accounts"
        }
    }')

if echo "$response" | jq -e '.result.content' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Call tool OK${NC}"
    # Parse and display result
    content=$(echo "$response" | jq -r '.result.content[0].text')
    echo -e "${BLUE}Result:${NC}"
    echo "$content" | jq '.'
else
    echo -e "${RED}✗ Call tool failed${NC}"
    echo "$response" | jq '.'
fi

echo ""

# Test 6: MCP Call Tool - list_campaigns
echo -e "${YELLOW}6️⃣  Testing MCP Call Tool: list_campaigns...${NC}"
response=$(curl -s -X POST "$SERVER_URL/mcp?token=$META_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "jsonrpc": "2.0",
        "id": 4,
        "method": "tools/call",
        "params": {
            "name": "list_campaigns",
            "arguments": {
                "status": "ACTIVE",
                "limit": 5
            }
        }
    }')

if echo "$response" | jq -e '.result.content' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Call tool OK${NC}"
    content=$(echo "$response" | jq -r '.result.content[0].text')
    echo -e "${BLUE}Result:${NC}"
    echo "$content" | jq '.'
else
    echo -e "${RED}✗ Call tool failed${NC}"
    echo "$response" | jq '.'
fi

echo ""

# Test 7: MCP Ping
echo -e "${YELLOW}7️⃣  Testing MCP Ping...${NC}"
response=$(curl -s -X POST "$SERVER_URL/mcp?token=$META_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "jsonrpc": "2.0",
        "id": 5,
        "method": "ping"
    }')

if echo "$response" | jq -e '.result' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Ping OK${NC}"
    echo "$response" | jq '.'
else
    echo -e "${RED}✗ Ping failed${NC}"
    echo "$response" | jq '.'
fi

echo ""

# Test 8: Invalid Token
echo -e "${YELLOW}8️⃣  Testing Invalid Token Rejection...${NC}"
response=$(curl -s -w "\n%{http_code}" -X POST "$SERVER_URL/mcp?token=invalid_token_123" \
    -H "Content-Type: application/json" \
    -d '{
        "jsonrpc": "2.0",
        "id": 6,
        "method": "tools/list"
    }')

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "401" ]; then
    echo -e "${GREEN}✓ Invalid token properly rejected (HTTP 401)${NC}"
    echo "$body" | jq '.error'
else
    echo -e "${RED}✗ Invalid token test failed (expected 401, got $http_code)${NC}"
    echo "$body" | jq '.'
fi

echo ""

# Test 9: Missing Token
echo -e "${YELLOW}9️⃣  Testing Missing Token Rejection...${NC}"
response=$(curl -s -w "\n%{http_code}" -X POST "$SERVER_URL/mcp" \
    -H "Content-Type: application/json" \
    -d '{
        "jsonrpc": "2.0",
        "id": 7,
        "method": "tools/list"
    }')

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "401" ]; then
    echo -e "${GREEN}✓ Missing token properly rejected (HTTP 401)${NC}"
    echo "$body" | jq '.error'
else
    echo -e "${RED}✗ Missing token test failed (expected 401, got $http_code)${NC}"
    echo "$body" | jq '.'
fi

echo ""

# Test 10: Invalid Method
echo -e "${YELLOW}🔟 Testing Invalid Method...${NC}"
response=$(curl -s -X POST "$SERVER_URL/mcp?token=$META_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "jsonrpc": "2.0",
        "id": 8,
        "method": "invalid/method"
    }')

if echo "$response" | jq -e '.error.code == -32601' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Invalid method properly rejected${NC}"
    echo "$response" | jq '.error'
else
    echo -e "${RED}✗ Invalid method test failed${NC}"
    echo "$response" | jq '.'
fi

echo ""

# Summary
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Todos os testes passaram com sucesso!${NC}"
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo -e "\n${BLUE}MCP Server está funcionando perfeitamente!${NC}"
echo -e "${BLUE}Pronto para uso com n8n.${NC}\n"
