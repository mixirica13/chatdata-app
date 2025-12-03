# Resumo da Refatoração - MCP Server HTTP Streamable

## 🎯 Objetivo Alcançado

Refatoração completa do MCP Server para **HTTP Streamable com autenticação via query parameter**, eliminando a necessidade de OAuth intermediário e tornando-o **100% compatível com n8n MCP Client Tool**.

---

## 🔄 O que Mudou

### ANTES (Versão Legacy)
- ❌ REST API tradicional com POST /api/v1/tools/call
- ❌ Autenticação via header `Authorization: Bearer mcp_token`
- ❌ Necessidade de criar MCP tokens no Supabase
- ❌ Fluxo complexo: Meta Token → MCP Token → Tools
- ❌ Não compatível com protocolo MCP oficial

### DEPOIS (Versão MCP Streamable)
- ✅ Protocolo MCP oficial (JSON-RPC 2.0)
- ✅ HTTP Streamable para n8n
- ✅ Autenticação via query parameter `?token=META_ACCESS_TOKEN`
- ✅ Sem necessidade de Supabase ou banco de dados
- ✅ Fluxo direto: Meta Token → Tools
- ✅ 100% compatível com n8n MCP Client Tool

---

## 📁 Novos Arquivos Criados

### Arquivos Principais (MCP)

1. **src/mcp-server.ts** ⭐
   - Servidor MCP HTTP Streamable principal
   - Implementa protocolo JSON-RPC 2.0
   - Endpoints: `/mcp` e `/meta-ads-mcp`

2. **src/types/mcp.ts**
   - Types do protocolo MCP
   - JSON-RPC request/response types
   - Definições de tools e capabilities

3. **src/services/mcpProtocol.ts**
   - Handler do protocolo MCP
   - Processa initialize, list_tools, call_tool
   - Formata respostas JSON-RPC

4. **src/services/toolAdapter.ts**
   - Adapta tools existentes para MCP
   - Converte Meta Token direto em UserToken
   - Bridge entre MCP e tools legadas

5. **src/middleware/mcpAuth.ts**
   - Autenticação via query parameter (?token=)
   - Valida token diretamente com Meta Graph API
   - Não depende de banco de dados

### Documentação

6. **N8N_GUIDE.md** ⭐
   - Guia completo de uso com n8n
   - Exemplos de configuração
   - Workflows de exemplo
   - Troubleshooting detalhado

7. **README_MCP.md**
   - README específico para versão MCP
   - Quick start
   - Arquitetura
   - Deploy

8. **MCP_REFACTOR_SUMMARY.md**
   - Este arquivo
   - Resumo das mudanças
   - Comparação antes/depois

### Scripts de Teste

9. **test-mcp.sh**
   - Suite de testes para protocolo MCP
   - Testa todos os métodos JSON-RPC
   - Validação de autenticação
   - Testes de edge cases

---

## 🚀 Como Usar

### Versão MCP (Recomendada para n8n)

```bash
# Iniciar servidor
npm run dev

# Usar com n8n
URL: http://localhost:3001/mcp?token=SEU_META_ACCESS_TOKEN
Transport: HTTP
```

### Versão Legacy (REST API)

```bash
# Iniciar servidor legado
npm run dev:legacy

# Usar com cURL
curl -X POST http://localhost:3001/api/v1/tools/call \
  -H "Authorization: Bearer mcp_token" \
  -d '{"tool":"list_campaigns"}'
```

---

## 🔌 Integração com n8n

### Configuração

1. **Adicionar nó MCP Client Tool**
2. **Criar credencial MCP:**
   - Transport: `HTTP`
   - URL: `http://localhost:3001/mcp?token=EAAB...`
   - Headers: `{"Content-Type": "application/json"}`

3. **Usar ferramentas:**
   - Operation: `Call Tool`
   - Tool Name: `list_campaigns`
   - Arguments: `{"status": "ACTIVE", "limit": 10}`

### Exemplo de Request JSON-RPC

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "list_campaigns",
    "arguments": {
      "status": "ACTIVE",
      "limit": 10
    }
  }
}
```

### Exemplo de Response

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\"data\":[{\"id\":\"123\",\"name\":\"Campanha 1\"}],\"metadata\":{\"cached\":false}}"
      }
    ]
  }
}
```

---

## 🛠️ Ferramentas Disponíveis

Todas as 5 ferramentas originais foram mantidas:

1. ✅ **list_ad_accounts** - Lista contas de anúncios
2. ✅ **list_campaigns** - Lista campanhas
3. ✅ **get_campaign_insights** - Insights de campanha
4. ✅ **get_account_insights** - Insights de conta
5. ✅ **search_campaigns** - Busca campanhas

---

## 📊 Endpoints Disponíveis

### Versão MCP

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/health` | GET | Health check |
| `/mcp/info` | GET | Informações do servidor |
| `/mcp` | POST | Endpoint MCP principal |
| `/meta-ads-mcp` | POST | Alias do endpoint MCP |

### Versão Legacy

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/health` | GET | Health check |
| `/api/v1/tools` | GET | Lista tools disponíveis |
| `/api/v1/tools/call` | POST | Executa uma tool |
| `/metrics` | GET | Métricas Prometheus |

---

## 🔒 Autenticação

### MCP (Nova)

```
URL com query parameter:
https://mcp.chatdata.pro/mcp?token=EAAB...seu_meta_access_token...
```

**Validação:**
1. Extrai token da query string
2. Valida direto com Meta Graph API
3. Busca contas de anúncios do usuário
4. Anexa informações na request

**Vantagens:**
- ✅ Sem banco de dados
- ✅ Sem tabela de tokens
- ✅ Validação em tempo real
- ✅ Simples e direto

### Legacy (Antiga)

```
Header:
Authorization: Bearer mcp_xyz123...
```

**Validação:**
1. Busca MCP token no Supabase
2. Verifica expiração do Meta token
3. Renova se necessário
4. Retorna erro se inválido

**Desvantagens:**
- ❌ Precisa Supabase
- ❌ Tabela mcp_tokens
- ❌ Fluxo mais complexo
- ❌ Mais pontos de falha

---

## 🎨 Arquitetura

### Fluxo MCP (Novo)

```
n8n MCP Client
    ↓
POST /mcp?token=EAAB...
    ↓
[mcpAuth Middleware]
  - Valida token com Meta API
  - Anexa info na request
    ↓
[MCP Protocol Handler]
  - Processa JSON-RPC request
  - Roteamento: initialize/list_tools/call_tool
    ↓
[Tool Adapter]
  - Converte Meta Token → UserToken
  - Executa tool apropriada
    ↓
[Tools] → [Meta API Client] → [Cache/Redis]
    ↓
JSON-RPC Response
```

### Fluxo Legacy (Antigo)

```
Cliente HTTP
    ↓
POST /api/v1/tools/call
Header: Authorization: Bearer mcp_token
    ↓
[authenticateMCPToken Middleware]
  - Busca token no Supabase
  - Valida expiração
  - Renova se necessário
    ↓
[Tool Executor]
  - Executa tool
    ↓
[Tools] → [Meta API Client] → [Cache/Redis]
    ↓
REST Response
```

---

## 📦 Dependências

### Necessárias (MCP)

- ✅ **express** - Web framework
- ✅ **ioredis** - Cache com Redis
- ✅ **winston** - Logging
- ✅ **zod** - Validação de schemas
- ✅ **cors** - CORS headers
- ✅ **helmet** - Security headers

### Opcionais (Legacy apenas)

- ⚠️ **@supabase/supabase-js** - Banco de dados
- ⚠️ **express-rate-limit** - Rate limiting avançado
- ⚠️ **prom-client** - Métricas Prometheus

---

## 🚢 Deploy

### Docker (Recomendado)

```bash
docker-compose up -d
```

**Variáveis necessárias:**
```env
NODE_ENV=production
PORT=3001
REDIS_HOST=redis
REDIS_PORT=6379
```

### Cloud (Render/Railway)

```bash
npm start
```

**Porta:** 3001
**Comando:** `node dist/mcp-server.js`

---

## 🧪 Testes

### Teste Rápido

```bash
# Health check
curl http://localhost:3001/health

# Server info
curl http://localhost:3001/mcp/info
```

### Teste Completo

```bash
# Com Meta Access Token
./test-mcp.sh EAAB...seu_meta_access_token...
```

**Testes inclusos:**
1. ✅ Health check
2. ✅ Server info
3. ✅ MCP Initialize
4. ✅ MCP List Tools
5. ✅ MCP Call Tool (list_ad_accounts)
6. ✅ MCP Call Tool (list_campaigns)
7. ✅ MCP Ping
8. ✅ Invalid token rejection
9. ✅ Missing token rejection
10. ✅ Invalid method rejection

---

## 📚 Documentação Disponível

| Arquivo | Descrição | Público |
|---------|-----------|---------|
| **N8N_GUIDE.md** | Guia completo para n8n | ⭐ Usuários n8n |
| **README_MCP.md** | README da versão MCP | Todos |
| **QUICKSTART.md** | Setup rápido | Novos usuários |
| **USAGE.md** | Guia versão legacy | Usuários REST API |
| **PROJECT_SUMMARY.md** | Resumo técnico | Desenvolvedores |
| **MCP_REFACTOR_SUMMARY.md** | Este arquivo | Time técnico |

---

## ✅ Checklist de Migração

### Para usuários do servidor legacy:

- [ ] Obter Meta Access Token dos usuários
- [ ] Atualizar URL para `/mcp?token=`
- [ ] Mudar de REST para JSON-RPC
- [ ] Testar com `./test-mcp.sh`
- [ ] Verificar cache funcionando
- [ ] Deploy em produção

### Para novos usuários (n8n):

- [ ] Iniciar servidor MCP
- [ ] Obter Meta Access Token
- [ ] Configurar credencial no n8n
- [ ] Adicionar nó MCP Client Tool
- [ ] Testar primeira tool
- [ ] Criar workflow

---

## 🎯 Próximos Passos

### Curto Prazo
- [ ] Deploy em https://mcp.chatdata.pro
- [ ] Documentar n8n workflows de exemplo
- [ ] Criar vídeo tutorial

### Médio Prazo
- [ ] Adicionar mais tools (criar/editar campanhas)
- [ ] Implementar webhooks do Meta
- [ ] Dashboard de monitoramento

### Longo Prazo
- [ ] Multi-tenancy
- [ ] Suporte a outras plataformas de ads
- [ ] Analytics avançados

---

## 🤝 Suporte

**Dúvidas sobre MCP + n8n?**
Veja [N8N_GUIDE.md](./N8N_GUIDE.md)

**Problemas técnicos?**
Verifique os logs: `docker-compose logs -f mcp-server`

**Quer contribuir?**
Abra uma issue ou PR no repositório!

---

## 🎉 Conclusão

O MCP Server foi completamente refatorado para seguir o **protocolo MCP oficial** com **HTTP Streamable**, tornando-o:

- ✅ **Mais simples** - Sem banco de dados, sem OAuth intermediário
- ✅ **Mais rápido** - Menos camadas, validação direta
- ✅ **Mais compatível** - Funciona perfeitamente com n8n
- ✅ **Mais mantível** - Menos dependências, código mais limpo

**Status:** 🟢 **Pronto para produção!**

---

*Última atualização: 02/12/2024*
