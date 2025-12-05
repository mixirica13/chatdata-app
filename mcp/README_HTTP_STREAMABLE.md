# MCP Server - HTTP Streamable (Protocol 2025-11-25)

## O que mudou?

Refatoração completa do MCP Server para implementar o **HTTP Streamable Transport** usando o SDK oficial `@modelcontextprotocol/sdk`.

### Principais mudanças:

1. ✅ **SDK Oficial**: Agora usa `@modelcontextprotocol/sdk` v1.24.3
2. ✅ **StreamableHTTPServerTransport**: Implementa transporte HTTP com SSE (Server-Sent Events)
3. ✅ **Protocolo 2025-11-25**: Atualizado para a especificação mais recente
4. ✅ **Gerenciamento de Sessões**: Implementado com header `mcp-session-id`
5. ✅ **Streaming Bidirecional**: Suporte completo a SSE para notificações em tempo real

## Arquitetura

```
┌─────────────┐                    ┌──────────────────┐
│   Cliente   │                    │   MCP Server     │
│   MCP       │                    │                  │
└──────┬──────┘                    └────────┬─────────┘
       │                                    │
       │  POST /mcp (initialize)            │
       ├───────────────────────────────────>│
       │                                    │  Cria sessão
       │  Response com mcp-session-id       │  e transport
       │<───────────────────────────────────┤
       │                                    │
       │  POST /mcp (tools/list)            │
       │  Header: mcp-session-id            │
       ├───────────────────────────────────>│
       │                                    │
       │  Response com lista de tools       │
       │<───────────────────────────────────┤
       │                                    │
       │  POST /mcp (tools/call)            │
       │  Header: mcp-session-id            │
       ├───────────────────────────────────>│
       │                                    │  Executa tool
       │  Response com resultado            │
       │<───────────────────────────────────┤
       │                                    │
       │  GET /mcp (SSE stream)             │
       │  Header: mcp-session-id            │
       ├───────────────────────────────────>│
       │                                    │
       │  Server-Sent Events stream         │  Notificações
       │<═══════════════════════════════════│  em tempo real
       │                                    │
       │  DELETE /mcp                       │
       │  Header: mcp-session-id            │
       ├───────────────────────────────────>│
       │                                    │  Fecha sessão
       │  200 OK                            │
       │<───────────────────────────────────┤
       │                                    │
```

## Endpoints

### 1. POST /mcp
**Enviar mensagens JSON-RPC ao servidor**

- **Autenticação**: Query parameter `?token=META_ACCESS_TOKEN`
- **Headers**:
  - `Content-Type: application/json`
  - `mcp-session-id` (opcional, apenas para requisições após initialize)
- **Body**: JSON-RPC 2.0 message

#### Exemplo - Initialize (criar nova sessão):
```bash
curl -X POST 'https://mcp.chatdata.pro/mcp?token=YOUR_META_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2025-11-25",
      "capabilities": {},
      "clientInfo": {
        "name": "my-client",
        "version": "1.0.0"
      }
    }
  }'
```

**Response** (com `mcp-session-id` header):
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2025-11-25",
    "capabilities": {
      "tools": {}
    },
    "serverInfo": {
      "name": "chatdata-meta-ads-mcp",
      "version": "2.0.0"
    }
  }
}
```

#### Exemplo - tools/list:
```bash
curl -X POST 'https://mcp.chatdata.pro/mcp?token=YOUR_META_TOKEN' \
  -H 'Content-Type: application/json' \
  -H 'mcp-session-id: <SESSION_ID_FROM_INITIALIZE>' \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list",
    "params": {}
  }'
```

#### Exemplo - tools/call:
```bash
curl -X POST 'https://mcp.chatdata.pro/mcp?token=YOUR_META_TOKEN' \
  -H 'Content-Type: application/json' \
  -H 'mcp-session-id: <SESSION_ID>' \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "list_ad_accounts",
      "arguments": {}
    }
  }'
```

### 2. GET /mcp
**Iniciar stream SSE para notificações do servidor**

- **Autenticação**: Query parameter `?token=META_ACCESS_TOKEN`
- **Headers**:
  - `Accept: text/event-stream`
  - `mcp-session-id` (obrigatório)

#### Exemplo:
```bash
curl -N 'https://mcp.chatdata.pro/mcp?token=YOUR_META_TOKEN' \
  -H 'Accept: text/event-stream' \
  -H 'mcp-session-id: <SESSION_ID>'
```

**Response**: Stream SSE
```
Content-Type: text/event-stream

event: message
data: {"jsonrpc":"2.0","method":"notifications/...","params":{...}}

event: message
data: {"jsonrpc":"2.0","method":"...","params":{...}}
```

### 3. DELETE /mcp
**Encerrar sessão**

- **Autenticação**: Query parameter `?token=META_ACCESS_TOKEN`
- **Headers**:
  - `mcp-session-id` (obrigatório)

#### Exemplo:
```bash
curl -X DELETE 'https://mcp.chatdata.pro/mcp?token=YOUR_META_TOKEN' \
  -H 'mcp-session-id: <SESSION_ID>'
```

### 4. GET /health
**Health check do servidor**

```bash
curl 'https://mcp.chatdata.pro/health'
```

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-12-04T10:00:00.000Z",
  "server": "chatdata-meta-ads-mcp",
  "version": "2.0.0",
  "protocol": "2025-11-25",
  "activeSessions": 5
}
```

### 5. GET /mcp/info
**Informações do servidor (sem autenticação)**

```bash
curl 'https://mcp.chatdata.pro/mcp/info'
```

**Response**:
```json
{
  "server": "chatdata-meta-ads-mcp",
  "version": "2.0.0",
  "protocol": "2025-11-25",
  "description": "Meta Ads MCP Server for Chatdata - HTTP Streamable with SSE",
  "transport": "HTTP Streamable (2025-11-25)",
  "authentication": {
    "type": "query_parameter",
    "parameter": "token",
    "description": "Meta Ads API access token",
    "example": "https://mcp.chatdata.pro/mcp?token=YOUR_META_ACCESS_TOKEN"
  },
  "endpoints": {
    "POST": "/mcp - Send JSON-RPC messages",
    "GET": "/mcp - Start SSE stream (requires mcp-session-id header)",
    "DELETE": "/mcp - Close session (requires mcp-session-id header)"
  },
  "tools": [
    "list_ad_accounts",
    "list_campaigns",
    "get_campaign_insights",
    "get_account_insights",
    "search_campaigns",
    "list_adsets",
    "get_adset_insights",
    "list_ads",
    "get_ad_insights"
  ],
  "features": [
    "Server-Sent Events (SSE) for bidirectional streaming",
    "Session management with mcp-session-id header",
    "Real-time notifications support",
    "JSON-RPC 2.0 protocol",
    "Meta Ads API integration"
  ]
}
```

## Gerenciamento de Sessões

### Como funciona:

1. **Inicialização**: Cliente envia POST /mcp com método `initialize` SEM header `mcp-session-id`
2. **Criação da sessão**: Servidor cria uma nova sessão com UUID único
3. **Response**: Servidor retorna o `mcp-session-id` no header da resposta
4. **Requisições subsequentes**: Cliente DEVE incluir header `mcp-session-id` em todas as requisições
5. **Persistência**: Sessões ficam ativas em memória no servidor
6. **Cleanup**: Sessões são removidas quando:
   - Cliente envia DELETE /mcp
   - Transport é fechado (onclose)
   - Callback `onsessionclosed` é chamado

### Exemplo de fluxo completo:

```javascript
// 1. Initialize
const initResponse = await fetch('https://mcp.chatdata.pro/mcp?token=XXX', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2025-11-25',
      capabilities: {},
      clientInfo: { name: 'my-client', version: '1.0.0' }
    }
  })
});

const sessionId = initResponse.headers.get('mcp-session-id');

// 2. List tools
const toolsResponse = await fetch('https://mcp.chatdata.pro/mcp?token=XXX', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'mcp-session-id': sessionId
  },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {}
  })
});

// 3. Call tool
const callResponse = await fetch('https://mcp.chatdata.pro/mcp?token=XXX', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'mcp-session-id': sessionId
  },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'list_ad_accounts',
      arguments: {}
    }
  })
});

// 4. Start SSE stream (opcional)
const eventSource = new EventSource(
  `https://mcp.chatdata.pro/mcp?token=XXX`,
  {
    headers: {
      'mcp-session-id': sessionId
    }
  }
);

eventSource.onmessage = (event) => {
  console.log('Notification:', JSON.parse(event.data));
};

// 5. Close session
await fetch('https://mcp.chatdata.pro/mcp?token=XXX', {
  method: 'DELETE',
  headers: {
    'mcp-session-id': sessionId
  }
});
```

## Tools Disponíveis

Todas as 9 tools anteriores continuam disponíveis:

1. **list_ad_accounts** - Lista contas de anúncios
2. **list_campaigns** - Lista campanhas
3. **get_campaign_insights** - Insights de campanha
4. **get_account_insights** - Insights de conta
5. **search_campaigns** - Busca campanhas por nome
6. **list_adsets** - Lista adsets de uma campanha
7. **get_adset_insights** - Insights de adset
8. **list_ads** - Lista anúncios de um adset
9. **get_ad_insights** - Insights de anúncio

## Executando o Servidor

### Modo Desenvolvimento:
```bash
cd mcp
npm run dev
```

### Modo Produção:
```bash
cd mcp
npm run build
npm start
```

### Docker:
```bash
cd mcp
docker-compose up -d
```

## Variáveis de Ambiente

Criar arquivo `.env` na pasta `mcp/`:

```env
# Server
PORT=3001
NODE_ENV=production

# CORS
CORS_ALLOWED_ORIGINS=https://chatdata.pro,https://app.chatdata.pro

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Meta API
META_API_VERSION=v21.0
```

## Logs

O servidor loga todas as operações importantes:

- ✅ Criação de sessões
- ✅ Reuso de sessões
- ✅ Fechamento de sessões
- ✅ Execução de tools
- ✅ Erros e exceções
- ✅ SSE streams

Exemplo de logs:
```
[2025-12-04 10:00:00] INFO: MCP: Creating new session
[2025-12-04 10:00:00] INFO: MCP: Session initialized { sessionId: 'abc-123', userId: 'user-1' }
[2025-12-04 10:00:01] INFO: MCP: tools/call { toolName: 'list_ad_accounts', userId: 'user-1' }
[2025-12-04 10:00:01] INFO: MCP: tool executed successfully { cached: true }
[2025-12-04 10:00:05] INFO: MCP: SSE stream requested { sessionId: 'abc-123' }
[2025-12-04 10:05:00] INFO: MCP: Session closed { sessionId: 'abc-123' }
```

## Compatibilidade

### ✅ Compatível com:
- Claude Code (via MCP Client Tool)
- n8n (MCP Client Node)
- Qualquer cliente MCP que suporte protocolo 2025-11-25
- Clients personalizados via HTTP + SSE

### ⚠️ Não compatível com:
- Protocolo MCP 2024-11-05 (versão antiga)
- Clientes que não suportam SSE
- Clientes que não enviam header `mcp-session-id`

## Troubleshooting

### Erro: "Invalid session"
- Certifique-se de enviar o header `mcp-session-id` após o initialize
- Verifique se a sessão não expirou (servidor reiniciado)

### Erro: "session ID not found"
- Você precisa primeiro fazer POST /mcp com método `initialize`
- O sessionId deve ser obtido do header de resposta

### SSE não conecta
- Verifique se está usando GET /mcp (não POST)
- Certifique-se de incluir header `Accept: text/event-stream`
- Confirme que o header `mcp-session-id` está correto

## Próximos Passos

- [ ] Implementar notificações proativas via SSE
- [ ] Adicionar suporte a resources do MCP
- [ ] Implementar prompts do MCP
- [ ] Adicionar métricas de sessões ativas
- [ ] Implementar persistência de sessões em Redis (opcional)

## Referências

- [MCP Specification 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [HTTP Streamable Transport](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)
