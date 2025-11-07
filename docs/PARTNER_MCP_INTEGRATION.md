# Integração MCP Server do Parceiro - MetaAura

## Sumário Executivo

Este documento especifica a integração com o **MCP Server do parceiro** que fornece acesso aos dados do Meta Ads. O parceiro gerencia toda a autenticação OAuth com Meta e fornece tokens de acesso para cada usuário.

---

## 1. Arquitetura Simplificada

### 1.1 Visão Geral

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Usuário    │      │   MetaAura   │      │ MCP Server   │      │  Meta API    │
│              │      │   (N8N)      │      │  (Parceiro)  │      │ (Facebook)   │
└──────┬───────┘      └──────┬───────┘      └──────┬───────┘      └──────┬───────┘
       │                     │                     │                     │
       │ 1. Pergunta        │                     │                     │
       ├────────────────────▶│                     │                     │
       │                     │                     │                     │
       │                     │ 2. Busca token     │                     │
       │                     │    no Supabase     │                     │
       │                     │                     │                     │
       │                     │ 3. Chama MCP       │                     │
       │                     │    com token       │                     │
       │                     ├────────────────────▶│                     │
       │                     │                     │                     │
       │                     │                     │ 4. Busca dados     │
       │                     │                     ├────────────────────▶│
       │                     │                     │                     │
       │                     │                     │ 5. Retorna dados   │
       │                     │                     │◀────────────────────│
       │                     │                     │                     │
       │                     │ 6. Resposta        │                     │
       │                     │    formatada       │                     │
       │                     │◀────────────────────│                     │
       │                     │                     │                     │
       │ 7. Resposta        │                     │                     │
       │◀────────────────────│                     │                     │
       │                     │                     │                     │
```

### 1.2 Fluxo de Funcionamento

**Resumo:**
1. Usuário conecta Meta Ads via interface do parceiro
2. Parceiro gera **token único** para o usuário
3. Armazenamos esse token no Supabase
4. No N8N, buscamos o token e usamos para chamar MCP Server
5. MCP Server retorna dados do Meta Ads
6. Claude AI processa e responde

**Diferencial:**
- ❌ **NÃO fazemos** OAuth direto com Meta
- ❌ **NÃO gerenciamos** renovação de tokens do Meta
- ✅ **Apenas armazenamos** token do parceiro
- ✅ **Parceiro gerencia** toda integração com Meta

---

## 2. Estrutura de Banco de Dados

### 2.1 Tabela: partner_mcp_tokens

**Propósito:** Armazenar tokens do MCP Server do parceiro

```sql
-- Migration: supabase/migrations/[timestamp]_create_partner_mcp_tokens.sql

CREATE TABLE IF NOT EXISTS public.partner_mcp_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Token fornecido pelo parceiro
  mcp_token TEXT NOT NULL UNIQUE,

  -- Informações sobre o token
  token_status TEXT DEFAULT 'active', -- active, expired, revoked

  -- Metadados (opcional)
  meta_user_id TEXT,              -- ID do usuário no Facebook (se fornecido)
  meta_user_name TEXT,            -- Nome do usuário no Facebook (se fornecido)
  meta_ad_account_ids TEXT[],     -- Array de IDs de contas conectadas

  -- Controle
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,

  -- Garantir um token por usuário
  CONSTRAINT unique_user_mcp_token UNIQUE(user_id)
);

-- Índices para performance
CREATE INDEX idx_partner_mcp_tokens_user_id ON public.partner_mcp_tokens(user_id);
CREATE INDEX idx_partner_mcp_tokens_mcp_token ON public.partner_mcp_tokens(mcp_token);
CREATE INDEX idx_partner_mcp_tokens_status ON public.partner_mcp_tokens(token_status);

-- RLS (Row Level Security)
ALTER TABLE public.partner_mcp_tokens ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seus próprios tokens
CREATE POLICY "Users can view their own tokens"
  ON public.partner_mcp_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuários podem atualizar seus próprios tokens
CREATE POLICY "Users can update their own tokens"
  ON public.partner_mcp_tokens
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Service role pode gerenciar todos os tokens
CREATE POLICY "Service role can manage all tokens"
  ON public.partner_mcp_tokens
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Função para atualizar last_used_at
CREATE OR REPLACE FUNCTION update_partner_token_last_used()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_used_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar last_used_at
CREATE TRIGGER trigger_update_partner_token_last_used
  BEFORE UPDATE ON public.partner_mcp_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_partner_token_last_used();

COMMENT ON TABLE public.partner_mcp_tokens IS 'Tokens do MCP Server do parceiro para acesso aos dados do Meta Ads';
COMMENT ON COLUMN public.partner_mcp_tokens.mcp_token IS 'Token gerado pelo parceiro para acessar MCP Server';
COMMENT ON COLUMN public.partner_mcp_tokens.token_status IS 'Status do token: active, expired, revoked';
```

### 2.2 Atualizar Tabela: subscribers

```sql
-- Migration: supabase/migrations/[timestamp]_add_partner_connected_to_subscribers.sql

ALTER TABLE public.subscribers
ADD COLUMN IF NOT EXISTS partner_mcp_connected BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_subscribers_partner_connected
  ON public.subscribers(partner_mcp_connected);

COMMENT ON COLUMN public.subscribers.partner_mcp_connected IS 'Indica se o usuário possui token do parceiro MCP ativo';
```

---

## 3. Fluxo de Conexão com Parceiro

### 3.1 Opção 1: Usuário Conecta via Interface do Parceiro

**Fluxo:**
1. Usuário acessa interface do parceiro
2. Parceiro redireciona para Meta OAuth
3. Usuário autoriza acesso
4. Parceiro gera token e retorna para MetaAura
5. MetaAura salva token no Supabase

**Implementação:**

```typescript
// src/pages/ConnectPartnerMCP.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Facebook, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const ConnectPartnerMCP = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [mcpToken, setMcpToken] = useState('');
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleConnect = async () => {
    if (!mcpToken.trim()) {
      toast.error('Por favor, insira o token fornecido pelo parceiro');
      return;
    }

    setIsConnecting(true);

    try {
      // Salvar token no banco
      const { error } = await supabase.functions.invoke('partner-save-token', {
        body: { mcp_token: mcpToken.trim() }
      });

      if (error) throw error;

      toast.success('Meta Ads conectado com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving token:', error);
      toast.error('Erro ao salvar token. Verifique e tente novamente.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectViaPartner = () => {
    // Redirecionar para interface do parceiro
    const partnerUrl = import.meta.env.VITE_PARTNER_CONNECT_URL;
    const callbackUrl = encodeURIComponent(`${window.location.origin}/partner/callback`);
    const userId = user?.id;

    window.location.href = `${partnerUrl}?callback=${callbackUrl}&user_id=${userId}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <Button variant="ghost" className="mb-4" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-500 p-4 rounded-2xl">
                <Facebook className="w-12 h-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Conectar Meta Ads</CardTitle>
            <CardDescription>
              Conecte via parceiro para acessar seus dados de campanhas
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Opção 1: Conectar via Interface do Parceiro */}
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-sm text-blue-900 font-medium mb-2">
                  Opção 1: Conectar via Parceiro (Recomendado)
                </p>
                <p className="text-sm text-blue-800 mb-4">
                  Você será redirecionado para autorizar o acesso de forma segura.
                </p>
                <Button
                  onClick={handleConnectViaPartner}
                  className="w-full bg-[#46CCC6] hover:bg-[#46CCC6]/90 text-black font-semibold"
                >
                  <Facebook className="w-5 h-5 mr-2" />
                  Conectar com Meta via Parceiro
                </Button>
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted-foreground">ou</span>
              </div>
            </div>

            {/* Opção 2: Inserir Token Manualmente */}
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">
                  Opção 2: Inserir Token Manualmente
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Se você já recebeu um token do parceiro, cole-o abaixo:
                </p>
                <Input
                  type="text"
                  placeholder="Cole seu token aqui..."
                  value={mcpToken}
                  onChange={(e) => setMcpToken(e.target.value)}
                  className="mb-3"
                />
                <Button
                  onClick={handleConnect}
                  disabled={isConnecting || !mcpToken.trim()}
                  className="w-full"
                  variant="outline"
                >
                  {isConnecting ? <LoadingSpinner size="sm" /> : 'Salvar Token'}
                </Button>
              </div>
            </div>

            {/* Informações */}
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm text-green-900 font-medium">
                    Seguro e Confiável
                  </p>
                  <p className="text-sm text-green-800 mt-1">
                    A autenticação é gerenciada pelo nosso parceiro certificado pela Meta.
                    Seus dados são protegidos e criptografados.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConnectPartnerMCP;
```

### 3.2 Página de Callback (Retorno do Parceiro)

```typescript
// src/pages/PartnerCallback.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { toast } from 'sonner';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PartnerCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const processCallback = async () => {
      try {
        const token = searchParams.get('token');
        const status = searchParams.get('status');
        const errorMsg = searchParams.get('error');

        if (status === 'error' || errorMsg) {
          setError(errorMsg || 'Erro ao conectar com parceiro');
          return;
        }

        if (!token) {
          setError('Token não recebido do parceiro');
          return;
        }

        // Salvar token no banco
        const { data, error: functionError } = await supabase.functions.invoke(
          'partner-save-token',
          {
            body: { mcp_token: token }
          }
        );

        if (functionError) {
          console.error('Function error:', functionError);
          setError('Erro ao salvar token. Tente novamente.');
          return;
        }

        if (!data?.success) {
          setError(data?.error || 'Erro desconhecido');
          return;
        }

        toast.success('Meta Ads conectado com sucesso!');
        navigate('/dashboard');
      } catch (err) {
        console.error('Callback error:', err);
        setError('Erro inesperado. Tente novamente.');
      }
    };

    processCallback();
  }, [navigate, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Erro na Conexão
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            onClick={() => navigate('/connect/partner-mcp')}
            className="w-full"
          >
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600 font-medium">
          Processando conexão com parceiro...
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Aguarde alguns instantes
        </p>
      </div>
    </div>
  );
};

export default PartnerCallback;
```

---

## 4. Edge Functions

### 4.1 Edge Function: partner-save-token

**Salvar token do parceiro no banco**

```typescript
// supabase/functions/partner-save-token/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { mcp_token } = await req.json();

    if (!mcp_token) {
      throw new Error('MCP token is required');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Validar token com MCP Server do parceiro (opcional)
    const validationUrl = Deno.env.get('PARTNER_MCP_VALIDATION_URL');
    if (validationUrl) {
      const validationResponse = await fetch(validationUrl, {
        headers: {
          'Authorization': `Bearer ${mcp_token}`,
        },
      });

      if (!validationResponse.ok) {
        throw new Error('Invalid MCP token');
      }

      // Extrair metadados se disponível
      const metadata = await validationResponse.json();
      console.log('Token metadata:', metadata);
    }

    // Salvar token no banco
    const { error: dbError } = await supabaseClient
      .from('partner_mcp_tokens')
      .upsert({
        user_id: user.id,
        mcp_token: mcp_token,
        token_status: 'active',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    // Atualizar flag na tabela subscribers
    const { error: updateError } = await supabaseClient
      .from('subscribers')
      .update({ partner_mcp_connected: true })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }

    console.log('Token saved successfully for user:', user.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Token saved successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in partner-save-token:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
```

### 4.2 Edge Function: partner-get-token (Para N8N)

**Buscar token do parceiro para usar no N8N**

```typescript
// supabase/functions/partner-get-token/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Buscar token do parceiro
    const { data: tokenData, error: fetchError } = await supabaseClient
      .from('partner_mcp_tokens')
      .select('mcp_token, token_status, last_used_at')
      .eq('user_id', user.id)
      .single();

    if (fetchError || !tokenData) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Partner MCP token not found',
          code: 'NOT_CONNECTED',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    if (tokenData.token_status !== 'active') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Token is not active',
          code: 'TOKEN_INACTIVE',
          status: tokenData.token_status,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      );
    }

    // Atualizar last_used_at
    await supabaseClient
      .from('partner_mcp_tokens')
      .update({ last_used_at: new Date().toISOString() })
      .eq('user_id', user.id);

    return new Response(
      JSON.stringify({
        success: true,
        mcp_token: tokenData.mcp_token,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in partner-get-token:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
```

### 4.3 Edge Function: partner-disconnect

**Desconectar token do parceiro**

```typescript
// supabase/functions/partner-disconnect/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Remover token
    const { error: deleteError } = await supabaseClient
      .from('partner_mcp_tokens')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      throw deleteError;
    }

    // Atualizar flag
    const { error: updateError } = await supabaseClient
      .from('subscribers')
      .update({ partner_mcp_connected: false })
      .eq('user_id', user.id);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in partner-disconnect:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
```

---

## 5. Integração N8N

### 5.1 Workflow N8N Atualizado

```json
{
  "nodes": [
    {
      "name": "Start",
      "type": "n8n-nodes-base.start",
      "position": [250, 300]
    },
    {
      "name": "Buscar Token do Usuário",
      "type": "n8n-nodes-base.supabase",
      "position": [450, 300],
      "parameters": {
        "operation": "getRows",
        "tableId": "partner_mcp_tokens",
        "filterType": "manual",
        "filters": {
          "conditions": [
            {
              "column": "user_id",
              "operator": "eq",
              "value": "={{ $json.user_id }}"
            }
          ]
        }
      }
    },
    {
      "name": "Verificar se Conectado",
      "type": "n8n-nodes-base.if",
      "position": [650, 300],
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "={{ $json.partner_mcp_connected }}",
              "value2": true
            }
          ]
        }
      }
    },
    {
      "name": "Chamar MCP Server",
      "type": "n8n-nodes-base.httpRequest",
      "position": [850, 200],
      "parameters": {
        "method": "POST",
        "url": "{{ $env.PARTNER_MCP_SERVER_URL }}",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "options": {
          "headers": {
            "Authorization": "Bearer {{ $json.mcp_token }}"
          }
        },
        "bodyParametersJson": "={{ JSON.stringify({\n  \"tool\": \"list_campaigns\",\n  \"parameters\": {\n    \"status\": \"ACTIVE\"\n  }\n}) }}"
      }
    },
    {
      "name": "Claude AI com MCP",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "position": [1050, 200],
      "parameters": {
        "agent": "conversationalAgent",
        "promptType": "define",
        "text": "={{ $json.user_message }}",
        "options": {
          "systemMessage": "Você é um assistente de marketing digital especializado em Meta Ads."
        }
      }
    },
    {
      "name": "Mensagem de Erro",
      "type": "n8n-nodes-base.set",
      "position": [850, 400],
      "parameters": {
        "values": {
          "string": [
            {
              "name": "response",
              "value": "Você precisa conectar sua conta Meta Ads primeiro. Acesse: https://app.metaaura.com/connect/partner-mcp"
            }
          ]
        }
      }
    }
  ],
  "connections": {
    "Start": {
      "main": [[{ "node": "Buscar Token do Usuário", "type": "main", "index": 0 }]]
    },
    "Buscar Token do Usuário": {
      "main": [[{ "node": "Verificar se Conectado", "type": "main", "index": 0 }]]
    },
    "Verificar se Conectado": {
      "main": [
        [{ "node": "Chamar MCP Server", "type": "main", "index": 0 }],
        [{ "node": "Mensagem de Erro", "type": "main", "index": 0 }]
      ]
    },
    "Chamar MCP Server": {
      "main": [[{ "node": "Claude AI com MCP", "type": "main", "index": 0 }]]
    }
  }
}
```

### 5.2 Configuração do Node Supabase no N8N

**Buscar Token do Usuário:**

```javascript
// Input do node anterior deve conter:
{
  "user_id": "uuid-do-usuario",
  "user_message": "Quais campanhas estão ativas?"
}

// Query Supabase:
SELECT mcp_token, token_status
FROM partner_mcp_tokens
WHERE user_id = '{{ $json.user_id }}'
  AND token_status = 'active'
LIMIT 1

// Output:
{
  "mcp_token": "partner_token_xxxxx",
  "token_status": "active"
}
```

### 5.3 Configuração do Node HTTP Request (MCP Server)

```javascript
// URL do MCP Server do Parceiro
URL: {{ $env.PARTNER_MCP_SERVER_URL }}

// Headers:
{
  "Authorization": "Bearer {{ $json.mcp_token }}",
  "Content-Type": "application/json"
}

// Body (JSON):
{
  "tool": "list_campaigns",
  "parameters": {
    "status": "ACTIVE",
    "limit": 10
  }
}

// Response esperada:
{
  "success": true,
  "data": [
    {
      "id": "campaign_123",
      "name": "Black Friday 2024",
      "status": "ACTIVE",
      "budget": 100.00
    }
  ]
}
```

---

## 6. Especificação do MCP Server do Parceiro

### 6.1 Endpoint Base

```
URL: https://partner-mcp-server.com/api/v1
```

### 6.2 Autenticação

```http
Authorization: Bearer {mcp_token}
```

### 6.3 Tools Disponíveis

#### Tool: list_campaigns

**Request:**
```json
{
  "tool": "list_campaigns",
  "parameters": {
    "status": "ACTIVE",
    "limit": 10
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "120212345678901234",
      "name": "Campanha Black Friday",
      "status": "ACTIVE",
      "objective": "OUTCOME_SALES",
      "daily_budget": "10000",
      "spend_today": "4532.15"
    }
  ]
}
```

#### Tool: get_campaign_insights

**Request:**
```json
{
  "tool": "get_campaign_insights",
  "parameters": {
    "campaign_id": "120212345678901234",
    "date_preset": "last_7d"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "campaign_id": "120212345678901234",
    "campaign_name": "Campanha Black Friday",
    "impressions": 125000,
    "clicks": 4500,
    "spend": 8500.50,
    "ctr": 3.6,
    "conversions": 85
  }
}
```

---

## 7. Variáveis de Ambiente

### 7.1 Frontend (.env)

```bash
VITE_PARTNER_CONNECT_URL=https://partner.com/connect
VITE_PARTNER_CALLBACK_URL=https://seu-dominio.com/partner/callback
```

### 7.2 Supabase (Secrets)

```bash
PARTNER_MCP_SERVER_URL=https://partner-mcp-server.com/api/v1
PARTNER_MCP_VALIDATION_URL=https://partner-mcp-server.com/api/v1/validate
```

### 7.3 N8N (Environment Variables)

```bash
PARTNER_MCP_SERVER_URL=https://partner-mcp-server.com/api/v1
```

---

## 8. Checklist de Implementação

### Fase 1: Banco de Dados
- [ ] Criar migration `partner_mcp_tokens`
- [ ] Adicionar campo `partner_mcp_connected` em `subscribers`
- [ ] Executar migrations no Supabase

### Fase 2: Edge Functions
- [ ] Implementar `partner-save-token`
- [ ] Implementar `partner-get-token`
- [ ] Implementar `partner-disconnect`
- [ ] Deploy das Edge Functions

### Fase 3: Frontend
- [ ] Criar página `ConnectPartnerMCP.tsx`
- [ ] Criar página `PartnerCallback.tsx`
- [ ] Adicionar rotas no `App.tsx`
- [ ] Testar fluxo de conexão

### Fase 4: N8N
- [ ] Atualizar workflow para buscar token do Supabase
- [ ] Configurar node HTTP Request para MCP Server
- [ ] Testar integração completa

### Fase 5: Testes
- [ ] Testar salvamento de token
- [ ] Testar busca de token no N8N
- [ ] Testar chamada ao MCP Server
- [ ] Testar resposta do Claude AI

---

## 9. Diagrama de Sequência Completo

```
Usuario    Frontend    Supabase    N8N    MCP Server    Meta API
  │            │           │        │          │            │
  │  1. Pergunta           │        │          │            │
  ├───────────▶│           │        │          │            │
  │            │           │        │          │            │
  │            │  2. Webhook        │          │            │
  │            ├──────────────────▶ │          │            │
  │            │           │        │          │            │
  │            │           │  3. Buscar token  │            │
  │            │           │◀───────┤          │            │
  │            │           │        │          │            │
  │            │           │  4. Token         │            │
  │            │           ├───────▶│          │            │
  │            │           │        │          │            │
  │            │           │        │  5. Call MCP          │
  │            │           │        ├─────────▶│            │
  │            │           │        │          │            │
  │            │           │        │          │  6. Call Meta
  │            │           │        │          ├───────────▶│
  │            │           │        │          │            │
  │            │           │        │          │  7. Data   │
  │            │           │        │          │◀───────────┤
  │            │           │        │          │            │
  │            │           │        │  8. Response          │
  │            │           │        │◀─────────┤            │
  │            │           │        │          │            │
  │            │  9. AI Response    │          │            │
  │            │◀──────────────────┤│          │            │
  │            │           │        │          │            │
  │ 10. Resposta          │        │          │            │
  │◀───────────┤           │        │          │            │
  │            │           │        │          │            │
```

---

## Contato e Suporte

**Desenvolvedor:** Paulo
**Projeto:** MetaAura - ChatData
**Versão:** 3.0.0 (Pipeboard Parceiro MCP)
**Data:** 04/11/2024

---

## Changelog

### v3.0.0 - 04/11/2024
- ✅ Simplificação completa da arquitetura
- ✅ Integração via token do parceiro
- ✅ Remoção de OAuth direto com Meta
- ✅ Tabela `partner_mcp_tokens` para armazenamento
- ✅ Edge Functions para gerenciamento de tokens
- ✅ Workflow N8N otimizado
- ✅ Documentação completa da integração
