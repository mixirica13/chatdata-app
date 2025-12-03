# Guia de Uso - MCP Server

## Como Usar o MCP Server

### 1. Configuração Inicial

#### 1.1. Criar App no Meta for Developers

1. Acesse https://developers.facebook.com/apps
2. Crie um novo app
3. Adicione o produto "Marketing API"
4. Configure as permissões:
   - `ads_read`
   - `ads_management`
   - `business_management`
5. Anote o **App ID** e **App Secret**

#### 1.2. Configurar Variáveis de Ambiente

```bash
cd mcp
cp .env.example .env
```

Edite o `.env` com suas credenciais:

```env
META_APP_ID=seu_app_id
META_APP_SECRET=seu_app_secret
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
```

#### 1.3. Criar Tabela no Supabase

Execute a migration no Supabase:

```bash
# Via Supabase CLI
supabase db push

# Ou copie e execute manualmente o SQL em:
# migrations/001_create_mcp_tokens_table.sql
```

### 2. Instalação e Execução

#### Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Iniciar Redis
docker run -d -p 6379:6379 redis:7-alpine

# Iniciar servidor
npm run dev
```

O servidor estará disponível em `http://localhost:3001`

#### Produção com Docker

```bash
# Build e start
docker-compose up -d

# Logs
docker-compose logs -f mcp-server

# Parar
docker-compose down
```

### 3. Fluxo de Autenticação

#### 3.1. Conectar Conta Meta (Frontend)

No seu frontend Chatdata, implemente o fluxo OAuth:

```typescript
// 1. Redirecionar usuário para autenticação Meta
const metaAuthUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${REDIRECT_URI}&scope=ads_read,ads_management,business_management`;

window.location.href = metaAuthUrl;

// 2. No callback, receber o código
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

// 3. Trocar código por access token
const response = await fetch(`https://graph.facebook.com/v21.0/oauth/access_token?client_id=${META_APP_ID}&redirect_uri=${REDIRECT_URI}&client_secret=${META_APP_SECRET}&code=${code}`);

const { access_token } = await response.json();

// 4. Criar MCP Token no servidor
const mcpResponse = await fetch('/api/create-mcp-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ meta_access_token: access_token })
});

const { mcp_token } = await mcpResponse.json();

// 5. Salvar mcp_token no localStorage ou state
localStorage.setItem('mcp_token', mcp_token);
```

#### 3.2. Criar Endpoint no Chatdata para Gerar MCP Token

```typescript
// app/api/create-mcp-token/route.ts
import { tokenManager } from '@/mcp/src/services/tokenManager';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  const { meta_access_token } = await req.json();

  // Buscar info do usuário Meta
  const meResponse = await fetch(`https://graph.facebook.com/v21.0/me?access_token=${meta_access_token}`);
  const { id: meta_user_id, name: meta_user_name } = await meResponse.json();

  // Buscar contas de anúncios
  const accountsResponse = await fetch(`https://graph.facebook.com/v21.0/me/adaccounts?access_token=${meta_access_token}`);
  const { data: accounts } = await accountsResponse.json();
  const ad_account_ids = accounts.map((acc: any) => acc.id);

  // Token expira em 60 dias (padrão do Meta)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 60);

  // Criar MCP token
  const { data: { user } } = await supabaseAdmin.auth.getUser();

  const userToken = await tokenManager.createMCPToken(
    user.id,
    meta_access_token,
    expiresAt,
    meta_user_id,
    meta_user_name,
    ad_account_ids
  );

  return Response.json({ mcp_token: userToken.mcp_token });
}
```

### 4. Usar as Tools

#### 4.1. Lista de Contas de Anúncios

```bash
curl -X POST http://localhost:3001/api/v1/tools/call \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mcp_xyz123..." \
  -d '{
    "tool": "list_ad_accounts"
  }'
```

Resposta:
```json
{
  "success": true,
  "tool": "list_ad_accounts",
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
    "cache_ttl": 3600,
    "execution_time_ms": 245
  }
}
```

#### 4.2. Listar Campanhas Ativas

```typescript
const response = await fetch('http://localhost:3001/api/v1/tools/call', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${mcp_token}`
  },
  body: JSON.stringify({
    tool: 'list_campaigns',
    parameters: {
      status: 'ACTIVE',
      limit: 10
    }
  })
});

const { data } = await response.json();
```

#### 4.3. Buscar Insights de Campanha

```typescript
const response = await fetch('http://localhost:3001/api/v1/tools/call', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${mcp_token}`
  },
  body: JSON.stringify({
    tool: 'get_campaign_insights',
    parameters: {
      campaign_id: '120212345678901234',
      date_preset: 'last_7d'
    }
  })
});

const { data } = await response.json();
// data contém: impressions, clicks, spend, ctr, cpc, cpm, reach, etc.
```

#### 4.4. Buscar Insights da Conta

```typescript
const response = await fetch('http://localhost:3001/api/v1/tools/call', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${mcp_token}`
  },
  body: JSON.stringify({
    tool: 'get_account_insights',
    parameters: {
      date_preset: 'today',
      level: 'account'
    }
  })
});

const { data } = await response.json();
```

#### 4.5. Buscar Campanhas por Nome

```typescript
const response = await fetch('http://localhost:3001/api/v1/tools/call', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${mcp_token}`
  },
  body: JSON.stringify({
    tool: 'search_campaigns',
    parameters: {
      query: 'black friday',
      limit: 5
    }
  })
});

const { data } = await response.json();
```

### 5. Integração com Chatdata Frontend

#### 5.1. Hook para usar MCP Tools

```typescript
// hooks/useMetaAds.ts
import { useState } from 'react';

export function useMetaAds() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callTool = async (tool: string, parameters?: any) => {
    setLoading(true);
    setError(null);

    try {
      const mcpToken = localStorage.getItem('mcp_token');

      if (!mcpToken) {
        throw new Error('MCP token not found. Please connect your Meta account.');
      }

      const response = await fetch('http://localhost:3001/api/v1/tools/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mcpToken}`
        },
        body: JSON.stringify({ tool, parameters })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to call tool');
      }

      const result = await response.json();
      return result.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { callTool, loading, error };
}
```

#### 5.2. Componente de Exemplo

```typescript
// components/MetaCampaigns.tsx
import { useEffect, useState } from 'react';
import { useMetaAds } from '@/hooks/useMetaAds';

export function MetaCampaigns() {
  const { callTool, loading, error } = useMetaAds();
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const data = await callTool('list_campaigns', {
        status: 'ACTIVE',
        limit: 20
      });
      setCampaigns(data);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Active Campaigns</h2>
      <ul>
        {campaigns.map((campaign: any) => (
          <li key={campaign.id}>
            {campaign.name} - ${campaign.daily_budget}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 6. Monitoramento

#### 6.1. Health Check

```bash
curl http://localhost:3001/health
```

#### 6.2. Métricas Prometheus

```bash
curl http://localhost:3001/metrics
```

#### 6.3. Logs

```bash
# Docker
docker-compose logs -f mcp-server

# Local (arquivos em logs/)
tail -f logs/combined.log
```

### 7. Tratamento de Erros

O servidor retorna erros estruturados:

```typescript
try {
  const data = await callTool('list_campaigns');
} catch (err: any) {
  // err.code pode ser:
  // - UNAUTHORIZED: Token inválido
  // - TOKEN_EXPIRED: Token expirado
  // - META_API_ERROR: Erro da Meta API
  // - RATE_LIMIT_EXCEEDED: Muitas requisições

  if (err.code === 'TOKEN_EXPIRED') {
    // Redirecionar para reconectar conta Meta
  }
}
```

### 8. Cache

O servidor usa cache inteligente:

- **list_ad_accounts**: 1 hora
- **list_campaigns**: 5 minutos
- **get_campaign_insights** (today): 5 minutos
- **get_campaign_insights** (histórico): 1 hora
- **get_account_insights**: Similar a insights de campanha

O cache é automático e transparente. A resposta inclui `metadata.cached` indicando se veio do cache.

### 9. Rate Limiting

Limites por padrão:
- **Por IP**: 60 requisições/minuto
- **Por usuário**: 120 requisições/minuto

Se exceder, você receberá erro `429 Too Many Requests`.

### 10. Segurança

- Sempre use HTTPS em produção
- Nunca exponha o `META_APP_SECRET`
- MCP tokens são únicos por usuário
- Tokens Meta são renovados automaticamente
- RLS (Row Level Security) ativo no Supabase

---

## Troubleshooting

### Erro: "Missing or invalid authorization header"
- Verifique se está enviando o header `Authorization: Bearer mcp_xxx`

### Erro: "Meta token expired and renewal failed"
- O usuário precisa reconectar a conta Meta
- Implemente fluxo de reconexão no frontend

### Erro: "No ad account available"
- O usuário não possui contas de anúncios conectadas
- Verifique as permissões do app Meta

### Redis connection error
- Verifique se o Redis está rodando
- Confira as variáveis `REDIS_HOST` e `REDIS_PORT`

### Supabase connection error
- Verifique as credenciais do Supabase
- Confirme que a tabela `mcp_tokens` foi criada
