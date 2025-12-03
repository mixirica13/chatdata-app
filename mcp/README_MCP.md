# MCP Server para Meta Ads - HTTP Streamable

## 🎯 Visão Geral

Servidor **Model Context Protocol (MCP)** compatível com **n8n** que fornece acesso à Meta Ads API através de 5 ferramentas especializadas.

### Características

- ✅ **Protocolo MCP oficial** (JSON-RPC 2.0 sobre HTTP)
- ✅ **HTTP Streamable** para compatibilidade total com n8n
- ✅ **Autenticação simples** via query parameter (?token=)
- ✅ **Sem OAuth intermediário** - usa direto o Meta Access Token
- ✅ **Cache inteligente** com Redis
- ✅ **5 tools prontas** para análise de campanhas
- ✅ **Docker ready** para deploy fácil

---

## 🚀 Quick Start

### 1. Configuração

```bash
cd mcp
cp .env.example .env
# Editar .env se necessário (Redis, CORS, etc)
```

### 2. Iniciar

**Com Docker (recomendado):**
```bash
docker-compose up -d
```

**Local:**
```bash
npm install
docker run -d -p 6379:6379 redis:7-alpine
npm run dev
```

### 3. Testar

```bash
curl http://localhost:3001/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "server": "chatdata-meta-ads-mcp",
  "version": "1.0.0",
  "protocol": "2024-11-05"
}
```

---

## 🔌 Como Usar

### Com n8n MCP Client Tool

1. **URL do Servidor:**
   ```
   http://localhost:3001/mcp?token=SEU_META_ACCESS_TOKEN
   ```

2. **Configuração:**
   - Transport: `HTTP`
   - URL: Incluir o `?token=` com o Meta Access Token
   - Headers: `{"Content-Type": "application/json"}`

3. **Tools Disponíveis:**
   - `list_ad_accounts`
   - `list_campaigns`
   - `get_campaign_insights`
   - `get_account_insights`
   - `search_campaigns`

📚 **Guia Completo:** Veja [N8N_GUIDE.md](./N8N_GUIDE.md)

---

## 🛠️ Ferramentas (Tools)

### 1. list_ad_accounts
Lista contas de anúncios do Meta Ads.

**Argumentos:** Nenhum obrigatório
```json
{
  "fields": "id,name,currency,account_status"
}
```

### 2. list_campaigns
Lista campanhas de uma conta.

**Argumentos:**
```json
{
  "ad_account_id": "act_123...",  // opcional
  "status": "ACTIVE",             // ACTIVE|PAUSED|ARCHIVED|ALL
  "limit": 25
}
```

### 3. get_campaign_insights
Busca métricas de uma campanha.

**Argumentos:**
```json
{
  "campaign_id": "120...",        // obrigatório
  "date_preset": "last_7d"        // today|yesterday|last_7d|last_30d|lifetime
}
```

### 4. get_account_insights
Busca métricas de uma conta.

**Argumentos:**
```json
{
  "ad_account_id": "act_123...",  // opcional
  "date_preset": "last_7d",
  "level": "account"              // account|campaign|adset|ad
}
```

### 5. search_campaigns
Busca campanhas por nome.

**Argumentos:**
```json
{
  "query": "black friday",        // obrigatório
  "limit": 10
}
```

---

## 🔧 Configuração Avançada

### Variáveis de Ambiente

```env
# Servidor
NODE_ENV=production
PORT=3001

# Redis (obrigatório)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Logs
LOG_LEVEL=info

# CORS
ALLOWED_ORIGINS=*
```

### Docker Compose

```yaml
version: '3.8'
services:
  mcp-server:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - REDIS_HOST=redis
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

---

## 📊 Endpoints

| Endpoint | Método | Descrição | Auth |
|----------|--------|-----------|------|
| `/health` | GET | Health check | Não |
| `/mcp/info` | GET | Info do servidor | Não |
| `/mcp` | POST | Endpoint MCP principal | Sim (?token=) |
| `/meta-ads-mcp` | POST | Alias do endpoint MCP | Sim (?token=) |

---

## 🔒 Autenticação

A autenticação é feita via **query parameter** na URL:

```
https://mcp.chatdata.pro/mcp?token=EAAB...seu_meta_access_token...
```

### Como obter o Meta Access Token

1. **Desenvolvimento:** https://developers.facebook.com/tools/explorer/
2. **Produção:** Seu sistema já deve ter os tokens dos usuários

⚠️ **IMPORTANTE:** O token deve ter as permissões:
- `ads_read`
- `ads_management`
- `business_management`

---

## 📝 Exemplos de Uso

### Exemplo 1: Teste com cURL

**Initialize:**
```bash
curl -X POST "http://localhost:3001/mcp?token=EAAB..." \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {"name": "test", "version": "1.0"}
    }
  }'
```

**List Tools:**
```bash
curl -X POST "http://localhost:3001/mcp?token=EAAB..." \
  -H "Content-Type": "application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list"
  }'
```

**Call Tool:**
```bash
curl -X POST "http://localhost:3001/mcp?token=EAAB..." \
  -H "Content-Type": "application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "list_ad_accounts"
    }
  }'
```

### Exemplo 2: n8n Workflow

Veja [N8N_GUIDE.md](./N8N_GUIDE.md) para exemplos completos de workflows.

---

## 🐛 Troubleshooting

### Erro: "Missing token in query parameter"
➡️ Adicione `?token=SEU_TOKEN` na URL

### Erro: "Invalid Meta access token"
➡️ Verifique se o token está válido e tem as permissões corretas

### Erro: "Redis connection error"
➡️ Certifique-se que o Redis está rodando: `docker ps`

### Cache não está funcionando
➡️ Verifique os logs: `docker-compose logs -f redis`

---

## 📚 Documentação

- **[N8N_GUIDE.md](./N8N_GUIDE.md)** - Guia completo para uso com n8n
- **[USAGE.md](./USAGE.md)** - Documentação do servidor legacy (REST API)
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Resumo técnico

---

## 🏗️ Arquitetura

```
n8n MCP Client Tool
    ↓
    POST /mcp?token=EAAB...
    ↓
[MCP Protocol Handler]
    ↓
[Tool Adapter] → [Meta API Client]
    ↓              ↓
[Cache Layer]   [Meta Graph API]
    ↓
[Redis]
```

---

## 📦 Estrutura do Projeto

```
mcp/
├── src/
│   ├── mcp-server.ts           # Servidor MCP principal ⭐
│   ├── services/
│   │   ├── mcpProtocol.ts      # Handler do protocolo MCP
│   │   ├── toolAdapter.ts      # Adaptador das tools
│   │   └── metaApi.ts          # Cliente Meta Graph API
│   ├── middleware/
│   │   └── mcpAuth.ts          # Autenticação via ?token=
│   ├── tools/                  # 5 tools do Meta Ads
│   └── types/
│       └── mcp.ts              # Types do protocolo MCP
├── N8N_GUIDE.md               # Guia de uso com n8n ⭐
├── docker-compose.yml
└── README_MCP.md              # Este arquivo
```

---

## 🚢 Deploy

### Render / Railway / Fly.io

1. Configure variável `PORT=3001`
2. Configure `REDIS_HOST` apontando para Redis externo
3. Use `npm start` como comando

### Docker

```bash
docker build -t mcp-server .
docker run -p 3001:3001 -e REDIS_HOST=redis mcp-server
```

---

## 📈 Monitoramento

### Logs

```bash
# Docker
docker-compose logs -f mcp-server

# Local
tail -f logs/combined.log
```

### Health Check

```bash
curl http://localhost:3001/health
```

---

## 🤝 Contribuindo

Encontrou um bug? Tem uma sugestão?

1. Abra uma issue
2. Descreva o problema/sugestão
3. Se possível, inclua logs

---

## 📄 Licença

MIT

---

## ✨ Próximos Passos

1. ✅ Servidor funcionando
2. ✅ Teste com n8n
3. ⬜ Deploy em produção
4. ⬜ Configurar monitoramento
5. ⬜ Adicionar mais tools (criar/editar campanhas)

---

**Pronto para usar!** 🎉

Para começar com n8n, veja [N8N_GUIDE.md](./N8N_GUIDE.md).
