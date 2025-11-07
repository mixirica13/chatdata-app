# Especificação Técnica - MCP Server API (Pipeboard)

## Documento para o Desenvolvedor

Este documento especifica os requisitos técnicos para implementar o **MCP Server** que fornecerá acesso aos dados do Meta Ads via Model Context Protocol (MCP).

---

## 1. Visão Geral

### 1.1 Objetivo

Implementar uma API REST que:
1. Recebe requisições autenticadas via token
2. Traduz para chamadas à Meta Graph API
3. Retorna dados formatados e limpos
4. Implementa cache inteligente para otimizar custos

### 1.2 Stack Tecnológica Recomendada

```
Runtime: Node.js 18+ / Deno / Bun
Framework: Express / Fastify / Hono
Linguagem: TypeScript
Cache: Redis / Upstash
Meta SDK: facebook-nodejs-business-sdk
Validação: Zod / Joi
HTTP Client: Axios / node-fetch
```

### 1.3 Fluxo de Requisição

```
MetaAura (N8N)
    │
    │ POST /api/v1/tools/call
    │ Headers: Authorization: Bearer {mcp_token}
    │ Body: { tool: "list_campaigns", parameters: {...} }
    │
    ▼
MCP Server (Pipeboard)
    │
    ├─► 1. Validar token
    ├─► 2. Buscar access_token do Meta
    ├─► 3. Verificar cache (Redis)
    │       │
    │       ├─► Cache Hit? → Retorna dados
    │       │
    │       └─► Cache Miss:
    │           ├─► 4. Chamar Meta Graph API
    │           ├─► 5. Processar resposta
    │           ├─► 6. Salvar no cache
    │           └─► 7. Retornar dados
    │
    ▼
Response JSON
```

---

## 2. Autenticação e Gerenciamento de Tokens

### 2.1 Estrutura de Tokens

Cada usuário do MetaAura possui:
- **MCP Token**: Token gerado pelo Pipeboard (usado pelo MetaAura)
- **Meta Access Token**: Token OAuth do Facebook (gerenciado pelo Pipeboard)

```typescript
// Estrutura de armazenamento (PostgreSQL, MongoDB, etc.)
interface UserToken {
  id: string;
  user_id: string;               // ID do usuário no MetaAura
  mcp_token: string;              // Token gerado pelo Pipeboard
  meta_access_token: string;      // Token OAuth do Meta
  meta_token_expires_at: Date;    // Expiração do token Meta
  meta_user_id: string;           // ID do usuário no Facebook
  meta_user_name: string;         // Nome do usuário
  ad_account_ids: string[];       // Contas de anúncios autorizadas
  created_at: Date;
  updated_at: Date;
}
```

### 2.2 Geração de MCP Token

```typescript
import crypto from 'crypto';

/**
 * Gera um token único para o usuário
 */
function generateMCPToken(): string {
  const prefix = 'mcp';
  const random = crypto.randomBytes(32).toString('hex');
  const timestamp = Date.now().toString(36);

  return `${prefix}_${timestamp}_${random}`;
}

// Exemplo de token gerado:
// mcp_l8k3j2h4_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

### 2.3 Validação de MCP Token

```typescript
import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: UserToken;
}

/**
 * Middleware de autenticação
 */
async function authenticateMCPToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header',
        code: 'UNAUTHORIZED',
      });
    }

    const mcpToken = authHeader.substring(7); // Remove "Bearer "

    // Buscar token no banco de dados
    const userToken = await db.userTokens.findOne({
      mcp_token: mcpToken,
    });

    if (!userToken) {
      return res.status(401).json({
        success: false,
        error: 'Invalid MCP token',
        code: 'INVALID_TOKEN',
      });
    }

    // Verificar se o token do Meta está expirado
    if (new Date() >= userToken.meta_token_expires_at) {
      // Renovar token do Meta
      const renewed = await renewMetaToken(userToken);

      if (!renewed) {
        return res.status(401).json({
          success: false,
          error: 'Meta token expired and renewal failed',
          code: 'TOKEN_EXPIRED',
        });
      }

      userToken.meta_access_token = renewed.access_token;
      userToken.meta_token_expires_at = renewed.expires_at;
    }

    // Anexar usuário à requisição
    req.user = userToken;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR',
    });
  }
}
```

### 2.4 Renovação Automática de Token Meta

```typescript
/**
 * Renova token do Meta antes de expirar
 */
async function renewMetaToken(userToken: UserToken) {
  try {
    const response = await fetch(
      'https://graph.facebook.com/v21.0/oauth/access_token',
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        params: {
          grant_type: 'fb_exchange_token',
          client_id: process.env.META_APP_ID,
          client_secret: process.env.META_APP_SECRET,
          fb_exchange_token: userToken.meta_access_token,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to renew Meta token:', data);
      return null;
    }

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + data.expires_in);

    // Atualizar no banco de dados
    await db.userTokens.update(
      { id: userToken.id },
      {
        meta_access_token: data.access_token,
        meta_token_expires_at: expiresAt,
        updated_at: new Date(),
      }
    );

    return {
      access_token: data.access_token,
      expires_at: expiresAt,
    };
  } catch (error) {
    console.error('Error renewing Meta token:', error);
    return null;
  }
}
```

---

## 3. Endpoints da API

### 3.1 Base URL

```
Produção: https://api.pipeboard.com/mcp/v1
Staging: https://staging-api.pipeboard.com/mcp/v1
```

### 3.2 Endpoint Principal: POST /tools/call

**Descrição:** Executa uma ferramenta (tool) do MCP com parâmetros fornecidos.

**Request:**

```http
POST /api/v1/tools/call
Content-Type: application/json
Authorization: Bearer mcp_l8k3j2h4_a1b2c3d4...

{
  "tool": "list_campaigns",
  "parameters": {
    "status": "ACTIVE",
    "limit": 10
  }
}
```

**Response (Success):**

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
      "daily_budget": "10000",
      "spend_today": "4532.15",
      "impressions_today": "12500",
      "clicks_today": "450"
    }
  ],
  "metadata": {
    "cached": false,
    "cache_ttl": 300,
    "execution_time_ms": 245
  }
}
```

**Response (Error):**

```json
{
  "success": false,
  "error": "Invalid tool name",
  "code": "INVALID_TOOL",
  "available_tools": [
    "list_ad_accounts",
    "list_campaigns",
    "get_campaign_insights",
    "get_account_insights",
    "search_campaigns"
  ]
}
```

### 3.3 Implementação do Endpoint

```typescript
import express from 'express';
import { z } from 'zod';

const app = express();
app.use(express.json());

// Schema de validação
const ToolRequestSchema = z.object({
  tool: z.enum([
    'list_ad_accounts',
    'list_campaigns',
    'get_campaign_insights',
    'get_account_insights',
    'search_campaigns',
  ]),
  parameters: z.record(z.any()).optional(),
});

app.post('/api/v1/tools/call', authenticateMCPToken, async (req, res) => {
  const startTime = Date.now();

  try {
    // Validar requisição
    const { tool, parameters } = ToolRequestSchema.parse(req.body);

    // Executar tool
    const result = await executeTool(tool, parameters || {}, req.user!);

    const executionTime = Date.now() - startTime;

    return res.status(200).json({
      success: true,
      tool,
      data: result.data,
      metadata: {
        cached: result.cached,
        cache_ttl: result.cache_ttl,
        execution_time_ms: executionTime,
      },
    });
  } catch (error) {
    console.error('Tool execution error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        code: 'VALIDATION_ERROR',
        details: error.errors,
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      code: 'EXECUTION_ERROR',
    });
  }
});
```

---

## 4. Implementação das Tools

### 4.1 Tool Registry Pattern

```typescript
type ToolHandler = (
  parameters: Record<string, any>,
  user: UserToken
) => Promise<ToolResult>;

interface ToolResult {
  data: any;
  cached: boolean;
  cache_ttl: number;
}

const toolRegistry: Record<string, ToolHandler> = {
  list_ad_accounts: listAdAccountsTool,
  list_campaigns: listCampaignsTool,
  get_campaign_insights: getCampaignInsightsTool,
  get_account_insights: getAccountInsightsTool,
  search_campaigns: searchCampaignsTool,
};

async function executeTool(
  toolName: string,
  parameters: Record<string, any>,
  user: UserToken
): Promise<ToolResult> {
  const handler = toolRegistry[toolName];

  if (!handler) {
    throw new Error(`Tool '${toolName}' not found`);
  }

  return await handler(parameters, user);
}
```

### 4.2 Tool 1: list_ad_accounts

**Parâmetros:**
```typescript
interface ListAdAccountsParams {
  fields?: string; // Default: "id,name,currency,account_status"
}
```

**Implementação:**

```typescript
import { bizSdk } from 'facebook-nodejs-business-sdk';

async function listAdAccountsTool(
  parameters: ListAdAccountsParams,
  user: UserToken
): Promise<ToolResult> {
  const cacheKey = `ad_accounts:${user.meta_user_id}`;
  const cacheTTL = 3600; // 1 hora

  // Verificar cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return {
      data: JSON.parse(cached),
      cached: true,
      cache_ttl: cacheTTL,
    };
  }

  // Chamar Meta API
  const api = bizSdk.FacebookAdsApi.init(user.meta_access_token);
  const fields = parameters.fields || 'id,name,currency,account_status';

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/me/adaccounts?fields=${fields}&access_token=${user.meta_access_token}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to fetch ad accounts');
    }

    const accounts = data.data.map((account: any) => ({
      id: account.id,
      name: account.name,
      currency: account.currency,
      status: account.account_status === 1 ? 'ACTIVE' : 'INACTIVE',
    }));

    // Salvar no cache
    await redis.setex(cacheKey, cacheTTL, JSON.stringify(accounts));

    return {
      data: accounts,
      cached: false,
      cache_ttl: cacheTTL,
    };
  } catch (error) {
    console.error('Error fetching ad accounts:', error);
    throw error;
  }
}
```

### 4.3 Tool 2: list_campaigns

**Parâmetros:**
```typescript
interface ListCampaignsParams {
  ad_account_id?: string;    // Se não fornecido, usar primeira conta
  status?: 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'ALL';
  limit?: number;            // Default: 25
  fields?: string;
}
```

**Implementação:**

```typescript
async function listCampaignsTool(
  parameters: ListCampaignsParams,
  user: UserToken
): Promise<ToolResult> {
  // Determinar conta de anúncios
  const adAccountId = parameters.ad_account_id || user.ad_account_ids[0];

  if (!adAccountId) {
    throw new Error('No ad account available');
  }

  const status = parameters.status || 'ACTIVE';
  const limit = parameters.limit || 25;
  const fields = parameters.fields || 'id,name,status,objective,daily_budget,effective_status';

  const cacheKey = `campaigns:${adAccountId}:${status}:${limit}`;
  const cacheTTL = 300; // 5 minutos

  // Verificar cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return {
      data: JSON.parse(cached),
      cached: true,
      cache_ttl: cacheTTL,
    };
  }

  // Construir URL da API
  let url = `https://graph.facebook.com/v21.0/${adAccountId}/campaigns?fields=${fields}&limit=${limit}&access_token=${user.meta_access_token}`;

  // Adicionar filtro de status se não for ALL
  if (status !== 'ALL') {
    const filtering = JSON.stringify([
      {
        field: 'effective_status',
        operator: 'IN',
        value: [status],
      },
    ]);
    url += `&filtering=${encodeURIComponent(filtering)}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to fetch campaigns');
    }

    const campaigns = data.data.map((campaign: any) => ({
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      effective_status: campaign.effective_status,
      objective: campaign.objective,
      daily_budget: campaign.daily_budget ? parseFloat(campaign.daily_budget) / 100 : null,
    }));

    // Salvar no cache
    await redis.setex(cacheKey, cacheTTL, JSON.stringify(campaigns));

    return {
      data: campaigns,
      cached: false,
      cache_ttl: cacheTTL,
    };
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    throw error;
  }
}
```

### 4.4 Tool 3: get_campaign_insights

**Parâmetros:**
```typescript
interface GetCampaignInsightsParams {
  campaign_id: string;
  date_preset?: 'today' | 'yesterday' | 'last_7d' | 'last_30d' | 'lifetime';
  time_range?: {
    since: string; // YYYY-MM-DD
    until: string; // YYYY-MM-DD
  };
  fields?: string;
}
```

**Implementação:**

```typescript
async function getCampaignInsightsTool(
  parameters: GetCampaignInsightsParams,
  user: UserToken
): Promise<ToolResult> {
  const { campaign_id, date_preset = 'last_7d', time_range, fields } = parameters;

  if (!campaign_id) {
    throw new Error('campaign_id is required');
  }

  const metricsFields = fields || 'campaign_id,campaign_name,impressions,clicks,spend,ctr,cpc,cpm,reach,frequency,actions';

  const cacheKey = `insights:${campaign_id}:${date_preset || JSON.stringify(time_range)}`;
  const cacheTTL = date_preset === 'today' ? 300 : 3600; // 5min ou 1h

  // Verificar cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return {
      data: JSON.parse(cached),
      cached: true,
      cache_ttl: cacheTTL,
    };
  }

  // Construir URL
  let url = `https://graph.facebook.com/v21.0/${campaign_id}/insights?fields=${metricsFields}&access_token=${user.meta_access_token}`;

  if (time_range) {
    url += `&time_range=${encodeURIComponent(JSON.stringify(time_range))}`;
  } else {
    url += `&date_preset=${date_preset}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to fetch insights');
    }

    if (!data.data || data.data.length === 0) {
      return {
        data: null,
        cached: false,
        cache_ttl: cacheTTL,
      };
    }

    const insights = data.data[0];

    // Processar ações (conversões)
    const actions = insights.actions || [];
    const conversions = actions.reduce((acc: any, action: any) => {
      acc[action.action_type] = parseInt(action.value);
      return acc;
    }, {});

    const result = {
      campaign_id: insights.campaign_id,
      campaign_name: insights.campaign_name,
      impressions: parseInt(insights.impressions || '0'),
      clicks: parseInt(insights.clicks || '0'),
      spend: parseFloat(insights.spend || '0'),
      ctr: parseFloat(insights.ctr || '0'),
      cpc: parseFloat(insights.cpc || '0'),
      cpm: parseFloat(insights.cpm || '0'),
      reach: parseInt(insights.reach || '0'),
      frequency: parseFloat(insights.frequency || '0'),
      conversions,
      date_start: insights.date_start,
      date_stop: insights.date_stop,
    };

    // Salvar no cache
    await redis.setex(cacheKey, cacheTTL, JSON.stringify(result));

    return {
      data: result,
      cached: false,
      cache_ttl: cacheTTL,
    };
  } catch (error) {
    console.error('Error fetching campaign insights:', error);
    throw error;
  }
}
```

### 4.5 Tool 4: get_account_insights

**Parâmetros:**
```typescript
interface GetAccountInsightsParams {
  ad_account_id?: string;
  date_preset?: string;
  level?: 'account' | 'campaign' | 'adset' | 'ad';
  breakdowns?: string[];
}
```

**Implementação:**

```typescript
async function getAccountInsightsTool(
  parameters: GetAccountInsightsParams,
  user: UserToken
): Promise<ToolResult> {
  const adAccountId = parameters.ad_account_id || user.ad_account_ids[0];
  const datePreset = parameters.date_preset || 'last_7d';
  const level = parameters.level || 'account';

  const cacheKey = `account_insights:${adAccountId}:${datePreset}:${level}`;
  const cacheTTL = datePreset === 'today' ? 300 : 3600;

  // Verificar cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return {
      data: JSON.parse(cached),
      cached: true,
      cache_ttl: cacheTTL,
    };
  }

  const fields = 'impressions,clicks,spend,ctr,cpc,cpm,reach,frequency,actions,cost_per_action_type';
  let url = `https://graph.facebook.com/v21.0/${adAccountId}/insights?fields=${fields}&date_preset=${datePreset}&level=${level}&access_token=${user.meta_access_token}`;

  if (parameters.breakdowns && parameters.breakdowns.length > 0) {
    url += `&breakdowns=${parameters.breakdowns.join(',')}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to fetch account insights');
    }

    const insights = data.data[0] || {};

    const result = {
      account_id: adAccountId,
      date_start: insights.date_start,
      date_stop: insights.date_stop,
      impressions: parseInt(insights.impressions || '0'),
      clicks: parseInt(insights.clicks || '0'),
      spend: parseFloat(insights.spend || '0'),
      ctr: parseFloat(insights.ctr || '0'),
      cpc: parseFloat(insights.cpc || '0'),
      cpm: parseFloat(insights.cpm || '0'),
      reach: parseInt(insights.reach || '0'),
      frequency: parseFloat(insights.frequency || '0'),
    };

    // Salvar no cache
    await redis.setex(cacheKey, cacheTTL, JSON.stringify(result));

    return {
      data: result,
      cached: false,
      cache_ttl: cacheTTL,
    };
  } catch (error) {
    console.error('Error fetching account insights:', error);
    throw error;
  }
}
```

### 4.6 Tool 5: search_campaigns

**Parâmetros:**
```typescript
interface SearchCampaignsParams {
  ad_account_id?: string;
  query: string;
  limit?: number;
}
```

**Implementação:**

```typescript
async function searchCampaignsTool(
  parameters: SearchCampaignsParams,
  user: UserToken
): Promise<ToolResult> {
  const adAccountId = parameters.ad_account_id || user.ad_account_ids[0];
  const query = parameters.query.toLowerCase();
  const limit = parameters.limit || 10;

  // Buscar todas as campanhas (do cache se possível)
  const allCampaigns = await listCampaignsTool(
    { ad_account_id: adAccountId, status: 'ALL', limit: 100 },
    user
  );

  // Filtrar por query
  const filtered = allCampaigns.data
    .filter((campaign: any) =>
      campaign.name.toLowerCase().includes(query)
    )
    .slice(0, limit)
    .map((campaign: any) => ({
      ...campaign,
      relevance_score: calculateRelevance(campaign.name, query),
    }))
    .sort((a: any, b: any) => b.relevance_score - a.relevance_score);

  return {
    data: filtered,
    cached: allCampaigns.cached,
    cache_ttl: 300,
  };
}

function calculateRelevance(name: string, query: string): number {
  const nameLower = name.toLowerCase();
  const queryLower = query.toLowerCase();

  // Exact match
  if (nameLower === queryLower) return 1.0;

  // Starts with query
  if (nameLower.startsWith(queryLower)) return 0.9;

  // Contains query
  if (nameLower.includes(queryLower)) return 0.7;

  // Fuzzy match (simplified)
  const words = queryLower.split(' ');
  const matchedWords = words.filter(word => nameLower.includes(word));
  return matchedWords.length / words.length * 0.5;
}
```

---

## 5. Sistema de Cache (Redis)

### 5.1 Configuração

```typescript
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: 0,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('error', (error) => {
  console.error('Redis error:', error);
});

redis.on('connect', () => {
  console.log('Redis connected');
});
```

### 5.2 Estratégia de Cache por Tool

| Tool | Cache Key Pattern | TTL | Invalidação |
|------|-------------------|-----|-------------|
| `list_ad_accounts` | `ad_accounts:{meta_user_id}` | 3600s (1h) | Manual |
| `list_campaigns` | `campaigns:{account_id}:{status}:{limit}` | 300s (5min) | Manual |
| `get_campaign_insights` | `insights:{campaign_id}:{date_range}` | 300s-3600s | Por data |
| `get_account_insights` | `account_insights:{account_id}:{date}:{level}` | 300s-3600s | Por data |
| `search_campaigns` | Usa cache de `list_campaigns` | 300s (5min) | - |

### 5.3 Cache Helper Functions

```typescript
/**
 * Helper para buscar do cache ou executar função
 */
async function withCache<T>(
  cacheKey: string,
  ttl: number,
  fetchFn: () => Promise<T>
): Promise<{ data: T; cached: boolean; cache_ttl: number }> {
  // Tentar buscar do cache
  const cached = await redis.get(cacheKey);

  if (cached) {
    return {
      data: JSON.parse(cached),
      cached: true,
      cache_ttl: ttl,
    };
  }

  // Executar função
  const data = await fetchFn();

  // Salvar no cache
  await redis.setex(cacheKey, ttl, JSON.stringify(data));

  return {
    data,
    cached: false,
    cache_ttl: ttl,
  };
}

/**
 * Invalidar cache de um usuário
 */
async function invalidateUserCache(userId: string) {
  const pattern = `*:${userId}:*`;
  const keys = await redis.keys(pattern);

  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
```

---

## 6. Rate Limiting e Throttling

### 6.1 Implementação de Rate Limit

```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

/**
 * Rate limiter para proteger a API
 */
const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rate_limit:',
  }),
  windowMs: 60 * 1000, // 1 minuto
  max: 60, // 60 requests por minuto por IP
  message: {
    success: false,
    error: 'Too many requests, please try again later',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);

/**
 * Rate limiter por usuário (MCP token)
 */
const userLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'user_rate_limit:',
  }),
  windowMs: 60 * 1000,
  max: 120, // 120 requests por minuto por usuário
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  },
  message: {
    success: false,
    error: 'User rate limit exceeded',
    code: 'USER_RATE_LIMIT_EXCEEDED',
  },
});

app.use('/api/v1/tools/', userLimiter);
```

### 6.2 Throttling de Chamadas à Meta API

```typescript
import Bottleneck from 'bottleneck';

/**
 * Limiter para Meta API
 * Meta permite ~200 chamadas por hora por usuário
 */
const metaApiLimiter = new Bottleneck({
  reservoir: 200, // Número inicial de chamadas
  reservoirRefreshAmount: 200,
  reservoirRefreshInterval: 60 * 60 * 1000, // 1 hora em ms
  maxConcurrent: 5, // Máximo de 5 chamadas simultâneas
  minTime: 100, // Mínimo 100ms entre chamadas
});

/**
 * Wrapper para chamadas à Meta API
 */
async function callMetaAPI(url: string): Promise<any> {
  return metaApiLimiter.schedule(async () => {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      // Verificar se é erro de rate limit
      if (data.error?.code === 4 || data.error?.code === 17) {
        console.warn('Meta API rate limit hit, will retry...');
        throw new Error('RATE_LIMIT');
      }

      throw new Error(data.error?.message || 'Meta API error');
    }

    return data;
  });
}
```

---

## 7. Tratamento de Erros

### 7.1 Error Codes

```typescript
enum ErrorCode {
  // Autenticação
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  // Validação
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_TOOL = 'INVALID_TOOL',
  MISSING_PARAMETER = 'MISSING_PARAMETER',

  // Meta API
  META_API_ERROR = 'META_API_ERROR',
  META_RATE_LIMIT = 'META_RATE_LIMIT',
  META_PERMISSION_DENIED = 'META_PERMISSION_DENIED',

  // Rate Limit
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  USER_RATE_LIMIT_EXCEEDED = 'USER_RATE_LIMIT_EXCEEDED',

  // Geral
  SERVER_ERROR = 'SERVER_ERROR',
  EXECUTION_ERROR = 'EXECUTION_ERROR',
}
```

### 7.2 Error Handler Middleware

```typescript
interface APIError {
  success: false;
  error: string;
  code: ErrorCode;
  details?: any;
}

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  // Erro de validação Zod
  if (err instanceof z.ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      code: ErrorCode.VALIDATION_ERROR,
      details: err.errors,
    } as APIError);
  }

  // Erro de rate limit
  if (err.message === 'RATE_LIMIT') {
    return res.status(429).json({
      success: false,
      error: 'Meta API rate limit exceeded',
      code: ErrorCode.META_RATE_LIMIT,
    } as APIError);
  }

  // Erro genérico
  return res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
    code: ErrorCode.SERVER_ERROR,
  } as APIError);
});
```

---

## 8. Monitoramento e Logs

### 8.1 Structured Logging

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});

// Log de requisições
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration_ms: duration,
      user_id: req.user?.id,
    });
  });

  next();
});
```

### 8.2 Métricas

```typescript
import promClient from 'prom-client';

// Criar registro
const register = new promClient.Registry();

// Métricas padrão
promClient.collectDefaultMetrics({ register });

// Contador de requisições por tool
const toolCallsCounter = new promClient.Counter({
  name: 'mcp_tool_calls_total',
  help: 'Total number of tool calls',
  labelNames: ['tool', 'status'],
  registers: [register],
});

// Histograma de latência
const toolLatencyHistogram = new promClient.Histogram({
  name: 'mcp_tool_latency_seconds',
  help: 'Tool execution latency in seconds',
  labelNames: ['tool'],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register],
});

// Gauge de cache hit rate
const cacheHitRate = new promClient.Gauge({
  name: 'mcp_cache_hit_rate',
  help: 'Cache hit rate percentage',
  registers: [register],
});

// Endpoint de métricas
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

---

## 9. Exemplo de Código Completo

### 9.1 Estrutura do Projeto

```
mcp-server/
├── src/
│   ├── index.ts                 # Entry point
│   ├── config/
│   │   ├── env.ts              # Environment variables
│   │   └── redis.ts            # Redis configuration
│   ├── middleware/
│   │   ├── auth.ts             # Authentication middleware
│   │   ├── rateLimit.ts        # Rate limiting
│   │   └── errorHandler.ts    # Error handling
│   ├── tools/
│   │   ├── index.ts            # Tool registry
│   │   ├── listAdAccounts.ts
│   │   ├── listCampaigns.ts
│   │   ├── getCampaignInsights.ts
│   │   ├── getAccountInsights.ts
│   │   └── searchCampaigns.ts
│   ├── services/
│   │   ├── metaApi.ts          # Meta API client
│   │   ├── cache.ts            # Cache service
│   │   └── tokenManager.ts     # Token management
│   ├── types/
│   │   └── index.ts            # TypeScript types
│   └── utils/
│       ├── logger.ts           # Winston logger
│       └── metrics.ts          # Prometheus metrics
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

### 9.2 Arquivo Principal (index.ts)

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env';
import { authenticateMCPToken } from './middleware/auth';
import { apiLimiter, userLimiter } from './middleware/rateLimit';
import { errorHandler } from './middleware/errorHandler';
import { executeTool } from './tools';
import { logger } from './utils/logger';
import { ToolRequestSchema } from './types';
import { register } from './utils/metrics';

const app = express();

// Middlewares globais
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Métricas (Prometheus)
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Endpoint principal
app.post(
  '/api/v1/tools/call',
  authenticateMCPToken,
  userLimiter,
  async (req, res, next) => {
    const startTime = Date.now();

    try {
      const { tool, parameters } = ToolRequestSchema.parse(req.body);

      logger.info('Tool execution started', {
        tool,
        user_id: req.user?.id,
      });

      const result = await executeTool(tool, parameters || {}, req.user!);

      const executionTime = Date.now() - startTime;

      logger.info('Tool execution completed', {
        tool,
        user_id: req.user?.id,
        execution_time_ms: executionTime,
        cached: result.cached,
      });

      return res.status(200).json({
        success: true,
        tool,
        data: result.data,
        metadata: {
          cached: result.cached,
          cache_ttl: result.cache_ttl,
          execution_time_ms: executionTime,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Error handler
app.use(errorHandler);

// Start server
const PORT = config.port || 3000;

app.listen(PORT, () => {
  logger.info(`MCP Server running on port ${PORT}`);
});
```

---

## 10. Deploy e Infraestrutura

### 10.1 Docker

**Dockerfile:**

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm ci --only=production

# Copiar código
COPY dist ./dist

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Iniciar aplicação
CMD ["node", "dist/index.js"]
```

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  mcp-server:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - REDIS_HOST=redis
      - META_APP_ID=${META_APP_ID}
      - META_APP_SECRET=${META_APP_SECRET}
    depends_on:
      - redis
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  redis_data:
```

### 10.2 Variáveis de Ambiente

```bash
# .env
NODE_ENV=production
PORT=3000

# Meta App
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Database (PostgreSQL/MongoDB)
DATABASE_URL=postgresql://user:password@localhost:5432/mcp_server

# Logging
LOG_LEVEL=info

# Rate Limiting
API_RATE_LIMIT_WINDOW_MS=60000
API_RATE_LIMIT_MAX=60
USER_RATE_LIMIT_MAX=120
```

---

## 11. Testes

### 11.1 Testes Unitários (Jest)

```typescript
// __tests__/tools/listCampaigns.test.ts
import { listCampaignsTool } from '../../src/tools/listCampaigns';
import { redis } from '../../src/config/redis';

jest.mock('../../src/config/redis');

describe('listCampaignsTool', () => {
  const mockUser = {
    id: 'user_123',
    mcp_token: 'mcp_xxx',
    meta_access_token: 'meta_xxx',
    meta_user_id: 'fb_123',
    ad_account_ids: ['act_123'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return cached campaigns if available', async () => {
    const cachedData = [{ id: 'campaign_1', name: 'Test' }];
    (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(cachedData));

    const result = await listCampaignsTool({}, mockUser);

    expect(result.cached).toBe(true);
    expect(result.data).toEqual(cachedData);
  });

  it('should fetch from Meta API if cache miss', async () => {
    (redis.get as jest.Mock).mockResolvedValue(null);
    // Mock fetch...
  });
});
```

### 11.2 Testes de Integração

```typescript
// __tests__/integration/api.test.ts
import request from 'supertest';
import app from '../../src/index';

describe('POST /api/v1/tools/call', () => {
  it('should require authentication', async () => {
    const response = await request(app)
      .post('/api/v1/tools/call')
      .send({ tool: 'list_campaigns' });

    expect(response.status).toBe(401);
  });

  it('should execute tool with valid token', async () => {
    const response = await request(app)
      .post('/api/v1/tools/call')
      .set('Authorization', 'Bearer valid_mcp_token')
      .send({ tool: 'list_campaigns', parameters: {} });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

---

## 12. Checklist de Implementação

### Fase 1: Setup (Semana 1)
- [ ] Configurar projeto Node.js/TypeScript
- [ ] Configurar Redis
- [ ] Configurar banco de dados
- [ ] Implementar autenticação básica
- [ ] Implementar logging

### Fase 2: Tools (Semana 2)
- [ ] Implementar `list_ad_accounts`
- [ ] Implementar `list_campaigns`
- [ ] Implementar `get_campaign_insights`
- [ ] Implementar `get_account_insights`
- [ ] Implementar `search_campaigns`

### Fase 3: Otimizações (Semana 3)
- [ ] Implementar sistema de cache completo
- [ ] Implementar rate limiting
- [ ] Implementar renovação automática de tokens
- [ ] Adicionar métricas e monitoramento

### Fase 4: Testes e Deploy (Semana 4)
- [ ] Escrever testes unitários
- [ ] Escrever testes de integração
- [ ] Configurar CI/CD
- [ ] Deploy em staging
- [ ] Deploy em produção

---

## Contato e Suporte

**Documento criado para:** Desenvolvedor Pipeboard
**Projeto:** MCP Server - MetaAura Integration
**Versão:** 1.0.0
**Data:** 04/11/2024

Para dúvidas técnicas:
- **Email:** paulo@metaaura.com
- **Documentação MetaAura:** `/docs/PARTNER_MCP_INTEGRATION.md`
