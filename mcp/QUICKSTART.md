# 🚀 Quick Start - MCP Server

## Setup em 5 Minutos

### 1️⃣ Configurar Variáveis de Ambiente

```bash
cd mcp
cp .env.example .env
```

Edite `.env` e preencha:
```env
META_APP_ID=seu_app_id_aqui
META_APP_SECRET=seu_app_secret_aqui
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

### 2️⃣ Criar Tabela no Supabase

1. Acesse o SQL Editor do Supabase
2. Cole e execute o SQL de `migrations/001_create_mcp_tokens_table.sql`

### 3️⃣ Iniciar o Servidor

#### Opção A: Com Docker (Recomendado)

```bash
docker-compose up -d
```

Pronto! Servidor rodando em `http://localhost:3001`

#### Opção B: Local (Desenvolvimento)

```bash
# Instalar dependências
npm install

# Iniciar Redis
docker run -d -p 6379:6379 redis:7-alpine

# Iniciar servidor
npm run dev
```

### 4️⃣ Testar

```bash
# Health check
curl http://localhost:3001/health

# Listar tools disponíveis
curl http://localhost:3001/api/v1/tools
```

---

## 🔑 Como Obter MCP Token

### No Frontend do Chatdata:

```typescript
// 1. Redirecionar para OAuth do Meta
const authUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${REDIRECT_URI}&scope=ads_read,ads_management`;
window.location.href = authUrl;

// 2. No callback, criar MCP token
const response = await fetch('/api/create-mcp-token', {
  method: 'POST',
  body: JSON.stringify({ code: oauthCode })
});

const { mcp_token } = await response.json();
localStorage.setItem('mcp_token', mcp_token);
```

---

## 📞 Fazer Primeira Chamada

```bash
# Substituir YOUR_MCP_TOKEN pelo token real
curl -X POST http://localhost:3001/api/v1/tools/call \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_MCP_TOKEN" \
  -d '{
    "tool": "list_ad_accounts"
  }'
```

Resposta esperada:
```json
{
  "success": true,
  "tool": "list_ad_accounts",
  "data": [
    {
      "id": "act_123...",
      "name": "Minha Conta",
      "currency": "BRL",
      "status": "ACTIVE"
    }
  ],
  "metadata": {
    "cached": false,
    "cache_ttl": 3600,
    "execution_time_ms": 245
  }
}
```

---

## 🛠️ Comandos Úteis

```bash
# Ver logs (Docker)
docker-compose logs -f mcp-server

# Parar servidor (Docker)
docker-compose down

# Rebuild (Docker)
docker-compose up -d --build

# Instalar dependências
npm install

# Rodar em dev
npm run dev

# Build TypeScript
npm run build

# Rodar em produção
npm start

# Testar servidor
./test-server.sh YOUR_MCP_TOKEN
```

---

## 📚 Documentação Completa

- 📖 **README.md** - Visão geral e instalação
- 📘 **USAGE.md** - Guia detalhado de uso
- 📊 **PROJECT_SUMMARY.md** - Resumo técnico

---

## ✅ Checklist de Setup

- [ ] Criar App no Meta for Developers
- [ ] Obter App ID e App Secret
- [ ] Criar projeto no Supabase
- [ ] Executar migration SQL
- [ ] Configurar .env
- [ ] Iniciar servidor (Docker ou local)
- [ ] Testar health check
- [ ] Implementar OAuth no frontend
- [ ] Criar endpoint para gerar MCP tokens
- [ ] Fazer primeira chamada autenticada

---

## 🆘 Problemas Comuns

### Erro: "Missing required environment variable"
➡️ Verifique se todas as variáveis do `.env` estão preenchidas

### Erro: "Redis connection error"
➡️ Inicie o Redis: `docker run -d -p 6379:6379 redis:7-alpine`

### Erro: "Supabase connection error"
➡️ Verifique as credenciais do Supabase no `.env`

### Erro: "Invalid MCP token"
➡️ Certifique-se de que o token foi criado corretamente no banco

### Porta 3001 já em uso
➡️ Mude a porta no `.env`: `PORT=3002`

---

## 🎯 Próximo Passo

Após o setup, veja **USAGE.md** para:
- Integrar com o frontend Chatdata
- Usar todas as 5 tools disponíveis
- Implementar componentes React
- Tratar erros e cache

**Dúvidas?** Consulte a documentação completa ou abra uma issue.
