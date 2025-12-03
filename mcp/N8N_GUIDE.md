# Guia de Integração com n8n

## MCP Server para Meta Ads - Compatível com n8n MCP Client Tool

Este guia mostra como usar o MCP Server do Meta Ads com o nó **MCP Client Tool** do n8n.

---

## 🚀 Visão Geral

O servidor implementa o **Model Context Protocol (MCP)** sobre **HTTP com streaming JSON-RPC**, permitindo que o n8n acesse dados do Meta Ads através de 5 ferramentas especializadas.

### Características

- ✅ **HTTP Streamable** (JSON-RPC 2.0)
- ✅ **Autenticação via Query Parameter** (?token=)
- ✅ **Sem OAuth intermediário** - usa direto o Meta Access Token
- ✅ **Cache inteligente** com Redis
- ✅ **5 tools prontas** para Meta Ads API
- ✅ **Compatível 100%** com n8n MCP Client Tool

---

## 📦 Setup Rápido

### 1. Iniciar o Servidor

```bash
cd mcp
cp .env.example .env
# Editar .env com suas credenciais

# Com Docker
docker-compose up -d

# Ou local
npm install
npm run dev
```

### 2. Obter Meta Access Token

Você já deve ter o access token dos seus usuários. Se não tiver, pode gerar um temporário:

1. Acesse: https://developers.facebook.com/tools/explorer/
2. Selecione seu app
3. Adicione permissões: `ads_read`, `ads_management`
4. Clique em "Generate Access Token"
5. Copie o token (começa com `EAAB...`)

---

## 🔌 Configuração no n8n

### Passo 1: Adicionar nó MCP Client Tool

1. No workflow do n8n, adicione o nó **MCP Client Tool**
2. Crie uma nova credencial MCP

### Passo 2: Configurar Credencial MCP

No campo de configuração da credencial:

**Transport Type:** `HTTP`

**Server URL:**
```
https://mcp.chatdata.pro/mcp?token=EAAB...seu_meta_access_token...
```

**Ou em desenvolvimento local:**
```
http://localhost:3001/mcp?token=EAAB...seu_meta_access_token...
```

⚠️ **IMPORTANTE:** O token vai na URL, não em headers!

**Headers:** (deixe vazio ou adicione Content-Type)
```json
{
  "Content-Type": "application/json"
}
```

### Passo 3: Configurar o Nó

Depois de criar a credencial:

1. **Operation:** Escolha a operação desejada
   - `List Tools` - Ver ferramentas disponíveis
   - `Call Tool` - Executar uma ferramenta

2. **Tool Name:** (se escolheu Call Tool)
   - `list_ad_accounts`
   - `list_campaigns`
   - `get_campaign_insights`
   - `get_account_insights`
   - `search_campaigns`

3. **Tool Arguments:** Parâmetros em JSON

---

## 🛠️ Ferramentas Disponíveis

### 1. list_ad_accounts

Lista todas as contas de anúncios do Meta Ads.

**Argumentos:**
```json
{
  "fields": "id,name,currency,account_status"
}
```

**Exemplo de resposta:**
```json
{
  "data": [
    {
      "id": "act_123456789",
      "name": "Minha Conta de Anúncios",
      "currency": "BRL",
      "status": "ACTIVE",
      "timezone_name": "America/Sao_Paulo"
    }
  ],
  "metadata": {
    "cached": false,
    "cache_ttl": 3600
  }
}
```

### 2. list_campaigns

Lista campanhas de uma conta.

**Argumentos:**
```json
{
  "ad_account_id": "act_123456789",
  "status": "ACTIVE",
  "limit": 25
}
```

**Opções de status:**
- `ACTIVE` - Apenas ativas
- `PAUSED` - Apenas pausadas
- `ARCHIVED` - Apenas arquivadas
- `ALL` - Todas

**Exemplo de resposta:**
```json
{
  "data": [
    {
      "id": "120212345678901234",
      "name": "Campanha Black Friday",
      "status": "ACTIVE",
      "effective_status": "ACTIVE",
      "objective": "OUTCOME_SALES",
      "daily_budget": 100.00
    }
  ],
  "metadata": {
    "cached": false,
    "cache_ttl": 300
  }
}
```

### 3. get_campaign_insights

Busca métricas de uma campanha específica.

**Argumentos:**
```json
{
  "campaign_id": "120212345678901234",
  "date_preset": "last_7d"
}
```

**Opções de date_preset:**
- `today` - Hoje
- `yesterday` - Ontem
- `last_7d` - Últimos 7 dias
- `last_30d` - Últimos 30 dias
- `lifetime` - Desde sempre

**Ou use período customizado:**
```json
{
  "campaign_id": "120212345678901234",
  "time_range": {
    "since": "2024-01-01",
    "until": "2024-01-31"
  }
}
```

**Exemplo de resposta:**
```json
{
  "data": {
    "campaign_id": "120212345678901234",
    "campaign_name": "Campanha Black Friday",
    "impressions": 125000,
    "clicks": 4500,
    "spend": 450.32,
    "ctr": 3.6,
    "cpc": 0.10,
    "cpm": 3.60,
    "reach": 85000,
    "frequency": 1.47,
    "conversions": {
      "purchase": 89,
      "add_to_cart": 234
    },
    "date_start": "2024-01-01",
    "date_stop": "2024-01-07"
  }
}
```

### 4. get_account_insights

Busca métricas de uma conta inteira.

**Argumentos:**
```json
{
  "ad_account_id": "act_123456789",
  "date_preset": "last_7d",
  "level": "account"
}
```

**Opções de level:**
- `account` - Nível de conta
- `campaign` - Por campanha
- `adset` - Por conjunto de anúncios
- `ad` - Por anúncio

**Com breakdowns:**
```json
{
  "ad_account_id": "act_123456789",
  "date_preset": "last_7d",
  "level": "account",
  "breakdowns": ["age", "gender"]
}
```

### 5. search_campaigns

Busca campanhas por nome.

**Argumentos:**
```json
{
  "query": "black friday",
  "ad_account_id": "act_123456789",
  "limit": 10
}
```

**Exemplo de resposta:**
```json
{
  "data": [
    {
      "id": "120212345678901234",
      "name": "Campanha Black Friday 2024",
      "status": "ACTIVE",
      "relevance_score": 0.9
    },
    {
      "id": "120212345678901235",
      "name": "Black Friday - Desconto 50%",
      "status": "PAUSED",
      "relevance_score": 0.7
    }
  ]
}
```

---

## 📝 Exemplos de Workflows n8n

### Exemplo 1: Listar Campanhas Ativas

```
[Trigger: Schedule]
    ↓
[MCP Client Tool]
  Operation: Call Tool
  Tool: list_campaigns
  Arguments: {"status": "ACTIVE", "limit": 10}
    ↓
[Code/Set Node]
  Processar dados das campanhas
    ↓
[Email/Slack]
  Enviar relatório
```

### Exemplo 2: Monitorar Gastos

```
[Trigger: Schedule (a cada hora)]
    ↓
[MCP Client Tool]
  Tool: get_account_insights
  Arguments: {"date_preset": "today"}
    ↓
[IF Node]
  spend > 1000?
    ↓
[Slack]
  Alertar equipe
```

### Exemplo 3: Buscar Insights de Campanha

```
[Webhook/Manual Trigger]
    ↓
[MCP Client Tool]
  Tool: get_campaign_insights
  Arguments: {"campaign_id": "{{$json.campaign_id}}", "date_preset": "last_7d"}
    ↓
[Set Node]
  Formatar dados
    ↓
[HTTP Request]
  Enviar para sistema externo
```

---

## 🔧 Troubleshooting

### Erro: "Unauthorized: Missing token in query parameter"

**Causa:** Token não foi passado na URL

**Solução:** Verifique se a URL está no formato:
```
http://localhost:3001/mcp?token=EAAB...
```

### Erro: "Invalid Meta access token"

**Causa:** Token expirado ou inválido

**Solução:**
1. Gere um novo token no Meta Developer Tools
2. Verifique as permissões (`ads_read`, `ads_management`)
3. Atualize a credencial no n8n

### Erro: "Tool not found"

**Causa:** Nome da ferramenta incorreto

**Solução:** Use exatamente um destes nomes:
- `list_ad_accounts`
- `list_campaigns`
- `get_campaign_insights`
- `get_account_insights`
- `search_campaigns`

### Erro: "No ad account available"

**Causa:** O token não tem acesso a nenhuma conta de anúncios

**Solução:**
1. Verifique se o usuário tem contas de anúncios no Meta Ads
2. Confirme as permissões do token
3. Use o Graph API Explorer para testar

---

## 🧪 Testando o Servidor

### Teste 1: Health Check

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

### Teste 2: Info do Servidor

```bash
curl http://localhost:3001/mcp/info
```

### Teste 3: Initialize (JSON-RPC)

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
      "clientInfo": {
        "name": "n8n",
        "version": "1.0.0"
      }
    }
  }'
```

### Teste 4: List Tools

```bash
curl -X POST "http://localhost:3001/mcp?token=EAAB..." \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list"
  }'
```

### Teste 5: Call Tool

```bash
curl -X POST "http://localhost:3001/mcp?token=EAAB..." \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "list_ad_accounts"
    }
  }'
```

---

## 🔒 Segurança

### Recomendações

1. **Use HTTPS em produção**
   ```
   https://mcp.chatdata.pro/mcp?token=...
   ```

2. **Rotacione tokens regularmente**
   - Tokens do Meta expiram em 60 dias
   - Configure renovação automática

3. **Não compartilhe tokens**
   - Cada usuário deve ter seu próprio token
   - Não commite tokens no Git

4. **Use variáveis de ambiente no n8n**
   - Configure tokens como variáveis
   - Ref: `{{$env.META_ACCESS_TOKEN}}`

---

## 📊 Monitoramento

### Logs

```bash
# Docker
docker-compose logs -f mcp-server

# Local
tail -f logs/combined.log
```

### Métricas

O servidor não expõe métricas Prometheus por padrão no modo MCP, mas você pode habilitar adicionando o endpoint `/metrics`.

---

## 🚢 Deploy em Produção

### Opção 1: Docker

```bash
docker-compose up -d
```

### Opção 2: Cloud (Render, Railway, etc.)

1. Configure variáveis de ambiente
2. Use `npm start` como comando
3. Porta: 3001

### Opção 3: Serverless (Vercel, Netlify)

⚠️ Não recomendado - MCP precisa de servidor persistente com Redis

---

## 📚 Recursos Adicionais

- **Especificação MCP:** https://spec.modelcontextprotocol.io/
- **Meta Ads API:** https://developers.facebook.com/docs/marketing-apis
- **n8n Docs:** https://docs.n8n.io/

---

## 💡 Dicas

1. **Cache:** Resultados são cacheados automaticamente
   - list_ad_accounts: 1 hora
   - list_campaigns: 5 minutos
   - insights (hoje): 5 minutos
   - insights (histórico): 1 hora

2. **Rate Limiting:** Meta API limita a 200 req/hora
   - O servidor implementa throttling automático
   - Use cache sempre que possível

3. **Debugging:** Ative logs detalhados
   ```env
   LOG_LEVEL=debug
   ```

---

## ✅ Checklist de Setup

- [ ] Servidor rodando (health check OK)
- [ ] Meta Access Token obtido
- [ ] Credencial MCP criada no n8n
- [ ] URL correta com ?token= configurada
- [ ] Teste de list_tools funcionando
- [ ] Primeira tool executada com sucesso
- [ ] Workflow criado e testado

---

**Pronto!** Seu MCP Server está configurado e pronto para uso com n8n.

Para dúvidas, consulte os logs ou abra uma issue no repositório.
