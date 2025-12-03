# Chatdata Meta Ads MCP Server

MCP (Model Context Protocol) Server para integração do Chatdata com a Meta Ads API.

## Visão Geral

Este servidor fornece uma API REST que traduz requisições autenticadas em chamadas à Meta Graph API, com cache inteligente, rate limiting e renovação automática de tokens.

## Funcionalidades

- ✅ Autenticação via MCP Token
- ✅ 5 ferramentas (tools) para acessar Meta Ads API
- ✅ Cache inteligente com Redis
- ✅ Rate limiting por IP e por usuário
- ✅ Renovação automática de tokens Meta
- ✅ Métricas Prometheus
- ✅ Logs estruturados
- ✅ Docker support

## Tools Disponíveis

1. **list_ad_accounts** - Lista contas de anúncios do usuário
2. **list_campaigns** - Lista campanhas de uma conta
3. **get_campaign_insights** - Busca insights de uma campanha
4. **get_account_insights** - Busca insights de uma conta
5. **search_campaigns** - Busca campanhas por nome

## Instalação

### Usando Docker (Recomendado)

```bash
# Copiar .env.example para .env e configurar
cp .env.example .env

# Editar .env com suas credenciais
# META_APP_ID, META_APP_SECRET, SUPABASE_URL, etc.

# Iniciar com Docker Compose
docker-compose up -d
```

### Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Copiar .env.example para .env
cp .env.example .env

# Editar .env com suas credenciais

# Iniciar Redis (necessário)
docker run -d -p 6379:6379 redis:7-alpine

# Iniciar em modo desenvolvimento
npm run dev
```

## Configuração

### Variáveis de Ambiente

```env
# Server
NODE_ENV=development
PORT=3001

# Meta App
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Logging
LOG_LEVEL=info

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Banco de Dados (Supabase)

É necessário criar a tabela `mcp_tokens` no Supabase:

```sql
CREATE TABLE mcp_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  mcp_token TEXT UNIQUE NOT NULL,
  meta_access_token TEXT NOT NULL,
  meta_token_expires_at TIMESTAMPTZ NOT NULL,
  meta_user_id TEXT NOT NULL,
  meta_user_name TEXT NOT NULL,
  ad_account_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mcp_tokens_mcp_token ON mcp_tokens(mcp_token);
CREATE INDEX idx_mcp_tokens_user_id ON mcp_tokens(user_id);
```

## Uso

### Autenticação

Todas as requisições devem incluir o header de autenticação:

```
Authorization: Bearer mcp_<token>
```

### Exemplo de Requisição

```bash
curl -X POST http://localhost:3001/api/v1/tools/call \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mcp_xyz123..." \
  -d '{
    "tool": "list_campaigns",
    "parameters": {
      "status": "ACTIVE",
      "limit": 10
    }
  }'
```

### Resposta de Sucesso

```json
{
  "success": true,
  "tool": "list_campaigns",
  "data": [
    {
      "id": "120212345678901234",
      "name": "Campanha Black Friday",
      "status": "ACTIVE",
      "objective": "OUTCOME_SALES",
      "daily_budget": 100.00
    }
  ],
  "metadata": {
    "cached": false,
    "cache_ttl": 300,
    "execution_time_ms": 245
  }
}
```

## Endpoints

### GET /health
Verifica se o servidor está rodando.

### GET /metrics
Retorna métricas do Prometheus.

### GET /api/v1/tools
Lista todas as ferramentas disponíveis.

### POST /api/v1/tools/call
Executa uma ferramenta com os parâmetros fornecidos.

## Scripts

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start

# Lint
npm run lint

# Tests
npm test
```

## Estrutura do Projeto

```
mcp/
├── src/
│   ├── config/          # Configurações (env, redis, supabase)
│   ├── middleware/      # Middlewares (auth, rateLimit, errorHandler)
│   ├── services/        # Serviços (metaApi, tokenManager)
│   ├── tools/           # Implementação das tools
│   ├── types/           # TypeScript types
│   ├── utils/           # Utilitários (logger, metrics, cache)
│   └── index.ts         # Entry point
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── README.md
```

## Monitoramento

### Logs

Os logs são estruturados em JSON e incluem:
- Timestamp
- Level (info, warn, error)
- Message
- Metadata (userId, tool, execution_time, etc.)

### Métricas (Prometheus)

Disponíveis em `/metrics`:
- `mcp_tool_calls_total` - Total de chamadas por tool
- `mcp_tool_latency_seconds` - Latência de execução
- `mcp_cache_hits_total` - Cache hits
- `mcp_cache_misses_total` - Cache misses
- `mcp_meta_api_calls_total` - Chamadas à Meta API

## Tratamento de Erros

O servidor retorna erros estruturados:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

Códigos de erro:
- `UNAUTHORIZED` - Token ausente ou inválido
- `INVALID_TOKEN` - Token MCP inválido
- `TOKEN_EXPIRED` - Token Meta expirado
- `VALIDATION_ERROR` - Erro de validação
- `META_API_ERROR` - Erro da Meta API
- `RATE_LIMIT_EXCEEDED` - Rate limit excedido

## Licença

MIT

## Suporte

Para problemas ou dúvidas, entre em contato com a equipe do Chatdata.
