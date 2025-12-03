# Exemplos Práticos - MCP Server Meta Ads

## 🎯 Exemplos de Uso com cURL

### 1. Initialize Session

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
        "name": "my-app",
        "version": "1.0.0"
      }
    }
  }'
```

**Resposta:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": {
        "listChanged": false
      }
    },
    "serverInfo": {
      "name": "chatdata-meta-ads-mcp",
      "version": "1.0.0"
    }
  }
}
```

---

### 2. List Available Tools

```bash
curl -X POST "http://localhost:3001/mcp?token=EAAB..." \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list"
  }'
```

**Resposta:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "tools": [
      {
        "name": "list_ad_accounts",
        "description": "Lista todas as contas de anúncios do Meta Ads...",
        "inputSchema": { ... }
      },
      {
        "name": "list_campaigns",
        "description": "Lista campanhas de uma conta...",
        "inputSchema": { ... }
      }
      // ... outras tools
    ]
  }
}
```

---

### 3. Listar Contas de Anúncios

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

**Resposta:**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\n  \"data\": [\n    {\n      \"id\": \"act_123456789\",\n      \"name\": \"Minha Conta Principal\",\n      \"currency\": \"BRL\",\n      \"status\": \"ACTIVE\",\n      \"timezone_name\": \"America/Sao_Paulo\"\n    }\n  ],\n  \"metadata\": {\n    \"cached\": false,\n    \"cache_ttl\": 3600\n  }\n}"
      }
    ]
  }
}
```

---

### 4. Listar Campanhas Ativas

```bash
curl -X POST "http://localhost:3001/mcp?token=EAAB..." \
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
  }'
```

**Resposta:**
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\n  \"data\": [\n    {\n      \"id\": \"120212345678901234\",\n      \"name\": \"Campanha Black Friday 2024\",\n      \"status\": \"ACTIVE\",\n      \"effective_status\": \"ACTIVE\",\n      \"objective\": \"OUTCOME_SALES\",\n      \"daily_budget\": 100.00\n    }\n  ]\n}"
      }
    ]
  }
}
```

---

### 5. Buscar Insights de Campanha (Últimos 7 Dias)

```bash
curl -X POST "http://localhost:3001/mcp?token=EAAB..." \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 5,
    "method": "tools/call",
    "params": {
      "name": "get_campaign_insights",
      "arguments": {
        "campaign_id": "120212345678901234",
        "date_preset": "last_7d"
      }
    }
  }'
```

**Resposta:**
```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\n  \"data\": {\n    \"campaign_id\": \"120212345678901234\",\n    \"campaign_name\": \"Campanha Black Friday 2024\",\n    \"impressions\": 125000,\n    \"clicks\": 4500,\n    \"spend\": 450.32,\n    \"ctr\": 3.6,\n    \"cpc\": 0.10,\n    \"cpm\": 3.60,\n    \"reach\": 85000,\n    \"frequency\": 1.47,\n    \"conversions\": {\n      \"purchase\": 89,\n      \"add_to_cart\": 234\n    },\n    \"date_start\": \"2024-11-25\",\n    \"date_stop\": \"2024-12-01\"\n  }\n}"
      }
    ]
  }
}
```

---

### 6. Buscar Insights com Período Customizado

```bash
curl -X POST "http://localhost:3001/mcp?token=EAAB..." \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 6,
    "method": "tools/call",
    "params": {
      "name": "get_campaign_insights",
      "arguments": {
        "campaign_id": "120212345678901234",
        "time_range": {
          "since": "2024-11-01",
          "until": "2024-11-30"
        }
      }
    }
  }'
```

---

### 7. Buscar Insights da Conta

```bash
curl -X POST "http://localhost:3001/mcp?token=EAAB..." \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 7,
    "method": "tools/call",
    "params": {
      "name": "get_account_insights",
      "arguments": {
        "date_preset": "today",
        "level": "account"
      }
    }
  }'
```

---

### 8. Buscar Campanhas por Nome

```bash
curl -X POST "http://localhost:3001/mcp?token=EAAB..." \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 8,
    "method": "tools/call",
    "params": {
      "name": "search_campaigns",
      "arguments": {
        "query": "black friday",
        "limit": 10
      }
    }
  }'
```

---

### 9. Ping (Verificar Conexão)

```bash
curl -X POST "http://localhost:3001/mcp?token=EAAB..." \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 9,
    "method": "ping"
  }'
```

**Resposta:**
```json
{
  "jsonrpc": "2.0",
  "id": 9,
  "result": {}
}
```

---

## 🔧 Exemplos com JavaScript/TypeScript

### Cliente MCP Simples

```typescript
class MCPClient {
  private baseUrl: string;
  private token: string;
  private requestId: number = 1;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  private async request(method: string, params?: any): Promise<any> {
    const url = `${this.baseUrl}?token=${this.token}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: this.requestId++,
        method,
        params,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.result;
  }

  async initialize() {
    return this.request('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'my-client',
        version: '1.0.0',
      },
    });
  }

  async listTools() {
    return this.request('tools/list');
  }

  async callTool(name: string, args?: any) {
    const result = await this.request('tools/call', {
      name,
      arguments: args,
    });

    // Parse text content
    const text = result.content[0].text;
    return JSON.parse(text);
  }
}

// Uso
const client = new MCPClient(
  'http://localhost:3001/mcp',
  'EAAB...seu_token...'
);

// Initialize
await client.initialize();

// List ad accounts
const accounts = await client.callTool('list_ad_accounts');
console.log(accounts.data);

// List campaigns
const campaigns = await client.callTool('list_campaigns', {
  status: 'ACTIVE',
  limit: 10,
});
console.log(campaigns.data);

// Get insights
const insights = await client.callTool('get_campaign_insights', {
  campaign_id: '120212345678901234',
  date_preset: 'last_7d',
});
console.log(insights.data);
```

---

## 📊 Exemplo com n8n (JSON)

### Workflow: Relatório Diário de Campanhas

```json
{
  "name": "Relatório Diário Meta Ads",
  "nodes": [
    {
      "name": "Schedule",
      "type": "n8n-nodes-base.scheduleTrigger",
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "hours",
              "hoursInterval": 24
            }
          ]
        }
      }
    },
    {
      "name": "List Campaigns",
      "type": "n8n-nodes-base.mcpClientTool",
      "parameters": {
        "operation": "callTool",
        "toolName": "list_campaigns",
        "toolArguments": {
          "status": "ACTIVE",
          "limit": 50
        }
      },
      "credentials": {
        "mcpApi": "Meta Ads MCP"
      }
    },
    {
      "name": "Get Insights for Each",
      "type": "n8n-nodes-base.mcpClientTool",
      "parameters": {
        "operation": "callTool",
        "toolName": "get_campaign_insights",
        "toolArguments": {
          "campaign_id": "={{$json.id}}",
          "date_preset": "yesterday"
        }
      }
    },
    {
      "name": "Format Report",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "const campaigns = items.map(item => ({\n  name: item.json.campaign_name,\n  spend: item.json.spend,\n  impressions: item.json.impressions,\n  clicks: item.json.clicks,\n  ctr: item.json.ctr\n}));\n\nreturn [{ json: { campaigns } }];"
      }
    },
    {
      "name": "Send Email",
      "type": "n8n-nodes-base.emailSend",
      "parameters": {
        "subject": "Relatório Diário - Meta Ads",
        "text": "={{JSON.stringify($json.campaigns, null, 2)}}"
      }
    }
  ],
  "connections": {
    "Schedule": {
      "main": [[{ "node": "List Campaigns" }]]
    },
    "List Campaigns": {
      "main": [[{ "node": "Get Insights for Each" }]]
    },
    "Get Insights for Each": {
      "main": [[{ "node": "Format Report" }]]
    },
    "Format Report": {
      "main": [[{ "node": "Send Email" }]]
    }
  }
}
```

---

## 🐍 Exemplo com Python

```python
import requests
import json

class MCPClient:
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url
        self.token = token
        self.request_id = 1

    def _request(self, method: str, params: dict = None):
        url = f"{self.base_url}?token={self.token}"

        payload = {
            "jsonrpc": "2.0",
            "id": self.request_id,
            "method": method,
        }

        if params:
            payload["params"] = params

        self.request_id += 1

        response = requests.post(
            url,
            headers={"Content-Type": "application/json"},
            json=payload
        )

        data = response.json()

        if "error" in data:
            raise Exception(data["error"]["message"])

        return data["result"]

    def initialize(self):
        return self._request("initialize", {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {
                "name": "python-client",
                "version": "1.0.0"
            }
        })

    def list_tools(self):
        return self._request("tools/list")

    def call_tool(self, name: str, arguments: dict = None):
        params = {"name": name}
        if arguments:
            params["arguments"] = arguments

        result = self._request("tools/call", params)

        # Parse text content
        text = result["content"][0]["text"]
        return json.loads(text)

# Uso
client = MCPClient(
    "http://localhost:3001/mcp",
    "EAAB...seu_token..."
)

# Initialize
client.initialize()

# List ad accounts
accounts = client.call_tool("list_ad_accounts")
print(accounts["data"])

# List campaigns
campaigns = client.call_tool("list_campaigns", {
    "status": "ACTIVE",
    "limit": 10
})
print(campaigns["data"])

# Get insights
insights = client.call_tool("get_campaign_insights", {
    "campaign_id": "120212345678901234",
    "date_preset": "last_7d"
})
print(insights["data"])
```

---

## 🔍 Casos de Uso Práticos

### 1. Dashboard de Métricas em Tempo Real

```typescript
// Buscar insights de todas as contas a cada hora
setInterval(async () => {
  const accounts = await client.callTool('list_ad_accounts');

  for (const account of accounts.data) {
    const insights = await client.callTool('get_account_insights', {
      ad_account_id: account.id,
      date_preset: 'today'
    });

    // Atualizar dashboard
    updateDashboard(account.name, insights.data);
  }
}, 3600000); // 1 hora
```

### 2. Alerta de Budget

```typescript
// Verificar se alguma campanha ultrapassou o budget
const campaigns = await client.callTool('list_campaigns', {
  status: 'ACTIVE'
});

for (const campaign of campaigns.data) {
  const insights = await client.callTool('get_campaign_insights', {
    campaign_id: campaign.id,
    date_preset: 'today'
  });

  if (insights.data.spend > campaign.daily_budget) {
    sendAlert(`Campanha ${campaign.name} ultrapassou o budget!`);
  }
}
```

### 3. Relatório Semanal Automatizado

```typescript
// Executar toda segunda-feira às 9h
const campaigns = await client.callTool('list_campaigns');

const report = [];

for (const campaign of campaigns.data) {
  const insights = await client.callTool('get_campaign_insights', {
    campaign_id: campaign.id,
    date_preset: 'last_7d'
  });

  report.push({
    name: campaign.name,
    spend: insights.data.spend,
    roi: calculateROI(insights.data),
    performance: classifyPerformance(insights.data)
  });
}

sendWeeklyReport(report);
```

---

## 🚨 Tratamento de Erros

```typescript
try {
  const result = await client.callTool('list_campaigns');
} catch (error) {
  if (error.code === -32000) {
    // Unauthorized
    console.error('Token inválido ou expirado');
  } else if (error.code === -32601) {
    // Method not found
    console.error('Tool não encontrada');
  } else if (error.code === -32602) {
    // Invalid params
    console.error('Parâmetros inválidos');
  } else {
    console.error('Erro desconhecido:', error.message);
  }
}
```

---

Para mais exemplos, consulte:
- **N8N_GUIDE.md** - Exemplos específicos para n8n
- **README_MCP.md** - Documentação completa
- **test-mcp.sh** - Suite de testes com exemplos práticos
