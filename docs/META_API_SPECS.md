# Especificações da API Meta/Facebook via MCP - MetaAura

## Sumário Executivo

Este documento especifica os requisitos técnicos para implementar a integração com Facebook/Meta no projeto MetaAura usando um **MCP Server (Model Context Protocol)** de um parceiro.

### Arquitetura do Sistema

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Usuário    │      │   WhatsApp   │      │     N8N      │      │  Agente IA   │
│  (Cliente)   │─────▶│ Evolution API│─────▶│  Workflows   │─────▶│   (Claude)   │
└──────────────┘      └──────────────┘      └──────────────┘      └──────┬───────┘
                                                                           │
                                                                           ▼
                                                              ┌──────────────────────┐
                                                              │   MCP Server         │
                                                              │   (Parceiro)         │
                                                              └──────────┬───────────┘
                                                                         │
                                                                         ▼
                                                              ┌──────────────────────┐
                                                              │   Meta Graph API     │
                                                              │   (Facebook Ads)     │
                                                              └──────────────────────┘
```

**Fluxo Operacional:**
1. Usuário envia mensagem no WhatsApp perguntando sobre campanhas
2. Evolution API recebe a mensagem
3. N8N processa e envia para o Agente de IA (Claude)
4. Agente de IA identifica que precisa de dados do Meta Ads
5. Agente chama o MCP Server do parceiro com parâmetros necessários
6. MCP Server busca dados na Meta Graph API
7. MCP Server retorna dados formatados para o Agente
8. Agente responde ao usuário via N8N → WhatsApp

**Diferencial desta Arquitetura:**
- ❌ **NÃO** fazemos polling ou sincronização periódica de dados
- ❌ **NÃO** armazenamos dados de campanhas no nosso banco
- ✅ **SIM** - Dados são buscados sob demanda (on-demand) via MCP
- ✅ **SIM** - Apenas armazenamos tokens de autenticação
- ✅ **SIM** - MCP Server do parceiro faz toda a comunicação com Meta API

---

## 1. O que é MCP (Model Context Protocol)?

### 1.1 Definição

O **Model Context Protocol (MCP)** é um protocolo aberto desenvolvido pela Anthropic que permite que sistemas de IA se conectem a fontes de dados externas de forma padronizada e segura.

**Características:**
- Protocolo cliente-servidor
- Comunicação via JSON-RPC 2.0
- Suporte a múltiplas ferramentas (tools)
- Autenticação e autorização por ferramenta
- Streaming de dados (opcional)

### 1.2 Componentes

```
┌─────────────────────────────────────────────────────────┐
│                    MCP Architecture                      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐         ┌──────────────────────────┐  │
│  │ MCP Client   │◀───────▶│  MCP Server (Parceiro)   │  │
│  │ (Claude AI)  │  JSON   │                          │  │
│  │              │  -RPC   │  ┌────────────────────┐  │  │
│  │              │         │  │  Meta Ads Tools    │  │  │
│  │              │         │  ├────────────────────┤  │  │
│  │              │         │  │ - list_campaigns   │  │  │
│  │              │         │  │ - get_insights     │  │  │
│  │              │         │  │ - get_ad_account   │  │  │
│  │              │         │  │ - search_ads       │  │  │
│  └──────────────┘         │  └────────────────────┘  │  │
│                           │                          │  │
│                           │  ┌────────────────────┐  │  │
│                           │  │  Graph API Client  │  │  │
│                           │  │  (Meta SDK)        │  │  │
│                           │  └────────────────────┘  │  │
│                           └──────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**MCP Client (Claude AI):**
- Envia requisições para o MCP Server
- Recebe e processa respostas
- Gerencia contexto da conversa

**MCP Server (Parceiro):**
- Expõe ferramentas (tools) para acesso à Meta API
- Autentica com Meta usando tokens do usuário
- Formata dados de retorno
- Gerencia rate limits e erros

---

## 2. Fluxo de Autenticação OAuth (Única Vez)

### 2.1 Objetivo

O usuário precisa conectar sua conta Meta **uma única vez** na interface web do MetaAura. Após isso, o token de acesso fica armazenado e é usado pelo MCP Server sempre que necessário.

### 2.2 Fluxo Detalhado

```
┌──────────┐       ┌──────────────┐       ┌──────────────┐       ┌──────────┐
│ Frontend │       │ Supabase     │       │ Meta OAuth   │       │ Database │
│ (React)  │       │ Edge Function│       │   Server     │       │          │
└────┬─────┘       └──────┬───────┘       └──────┬───────┘       └────┬─────┘
     │                    │                      │                    │
     │ 1. Click "Conectar Meta"                 │                    │
     ├───────────────────▶│                      │                    │
     │                    │                      │                    │
     │ 2. Redirect to Meta OAuth                │                    │
     ├──────────────────────────────────────────▶│                    │
     │                    │                      │                    │
     │                    │   3. User logs in    │                    │
     │                    │      & authorizes    │                    │
     │                    │                      │                    │
     │ 4. Callback with code                    │                    │
     │◀──────────────────────────────────────────│                    │
     │                    │                      │                    │
     │ 5. Send code to Edge Function            │                    │
     ├───────────────────▶│                      │                    │
     │                    │                      │                    │
     │                    │ 6. Exchange code for token               │
     │                    ├─────────────────────▶│                    │
     │                    │◀─────────────────────│                    │
     │                    │                      │                    │
     │                    │ 7. Save token + meta_user_id             │
     │                    ├──────────────────────────────────────────▶│
     │                    │                      │                    │
     │ 8. Success response│                      │                    │
     │◀───────────────────│                      │                    │
     │                    │                      │                    │
```

### 2.3 Dados Armazenados

Após autenticação, salvamos:

```typescript
interface MetaConnection {
  user_id: string;              // ID do usuário no Supabase Auth
  meta_user_id: string;          // ID do usuário no Facebook
  meta_user_name: string;        // Nome do usuário no Facebook
  access_token: string;          // Token de acesso (60 dias)
  token_type: 'bearer';
  expires_at: Date;              // Data de expiração
  created_at: Date;
  updated_at: Date;
}
```

**Importante:**
- ✅ Armazenamos apenas credenciais de autenticação
- ❌ NÃO armazenamos dados de campanhas, métricas ou anúncios
- ✅ Token é renovado automaticamente antes de expirar

---

## 3. Estrutura de Banco de Dados

### 3.1 Tabela: meta_connections

**Propósito:** Armazenar tokens de acesso OAuth do Meta

```sql
-- Migration: supabase/migrations/[timestamp]_create_meta_connections.sql

CREATE TABLE IF NOT EXISTS public.meta_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meta_user_id TEXT NOT NULL,
  meta_user_name TEXT,
  access_token TEXT NOT NULL,
  token_type TEXT DEFAULT 'bearer',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraint para garantir uma conexão por usuário
  CONSTRAINT unique_user_meta_connection UNIQUE(user_id)
);

-- Índices para performance
CREATE INDEX idx_meta_connections_user_id ON public.meta_connections(user_id);
CREATE INDEX idx_meta_connections_expires_at ON public.meta_connections(expires_at);
CREATE INDEX idx_meta_connections_meta_user_id ON public.meta_connections(meta_user_id);

-- RLS (Row Level Security)
ALTER TABLE public.meta_connections ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas suas próprias conexões
CREATE POLICY "Users can view their own meta connections"
  ON public.meta_connections
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Service role pode gerenciar todas as conexões
CREATE POLICY "Service role can manage all meta connections"
  ON public.meta_connections
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Função para limpar tokens expirados (executar via cron)
CREATE OR REPLACE FUNCTION clean_expired_meta_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM public.meta_connections
  WHERE expires_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.meta_connections IS 'Armazena tokens de acesso OAuth do Meta/Facebook para uso com MCP Server';
COMMENT ON COLUMN public.meta_connections.access_token IS 'Token de acesso de longa duração (60 dias) - usado pelo MCP Server';
COMMENT ON COLUMN public.meta_connections.meta_user_id IS 'ID do usuário no Facebook/Meta';
```

### 3.2 Atualizar Tabela: subscribers

Adicionar campo para indicar status de conexão:

```sql
-- Migration: supabase/migrations/[timestamp]_add_meta_connected_to_subscribers.sql

ALTER TABLE public.subscribers
ADD COLUMN IF NOT EXISTS meta_connected BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_subscribers_meta_connected
  ON public.subscribers(meta_connected);

COMMENT ON COLUMN public.subscribers.meta_connected IS 'Indica se o usuário possui Meta Ads conectado';
```

### 3.3 Opcional: Tabela de Audit Logs

Para rastrear chamadas ao MCP Server:

```sql
-- Migration: supabase/migrations/[timestamp]_create_mcp_audit_logs.sql

CREATE TABLE IF NOT EXISTS public.mcp_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,              -- Ex: 'list_campaigns', 'get_insights'
  parameters JSONB,                      -- Parâmetros enviados ao MCP
  response_status TEXT,                  -- 'success', 'error'
  response_summary TEXT,                 -- Resumo da resposta ou mensagem de erro
  execution_time_ms INTEGER,             -- Tempo de execução em ms
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_mcp_audit_logs_user_id ON public.mcp_audit_logs(user_id);
CREATE INDEX idx_mcp_audit_logs_created_at ON public.mcp_audit_logs(created_at DESC);
CREATE INDEX idx_mcp_audit_logs_tool_name ON public.mcp_audit_logs(tool_name);

ALTER TABLE public.mcp_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own mcp logs"
  ON public.mcp_audit_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all mcp logs"
  ON public.mcp_audit_logs
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

COMMENT ON TABLE public.mcp_audit_logs IS 'Logs de auditoria de chamadas ao MCP Server do parceiro';
```

---

## 4. Implementação Frontend

### 4.1 Variáveis de Ambiente

```bash
# .env (Frontend)
VITE_META_APP_ID=seu_app_id_do_parceiro
VITE_META_REDIRECT_URI=https://seu-dominio.com/meta/callback
```

### 4.2 Atualizar: ConnectMeta.tsx

```typescript
// src/pages/ConnectMeta.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Facebook, CheckCircle2, ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const ConnectMeta = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    meta_user_name?: string;
    expires_at?: string;
  }>({ connected: false });

  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    checkConnection();
  }, [profile?.meta_connected]);

  // Verificar se usuário já tem conexão ativa
  const checkConnection = async () => {
    try {
      if (profile?.meta_connected && user) {
        const { data, error } = await supabase
          .from('meta_connections')
          .select('meta_user_name, expires_at')
          .eq('user_id', user.id)
          .single();

        if (!error && data) {
          setConnectionStatus({
            connected: true,
            meta_user_name: data.meta_user_name,
            expires_at: data.expires_at,
          });
        }
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Iniciar OAuth Flow
  const handleConnect = () => {
    setIsConnecting(true);

    const appId = import.meta.env.VITE_META_APP_ID;
    const redirectUri = import.meta.env.VITE_META_REDIRECT_URI;
    const state = crypto.randomUUID();

    // Salvar state para validação CSRF
    localStorage.setItem('meta_oauth_state', state);

    // Permissões necessárias para leitura de campanhas
    const scopes = [
      'ads_read',           // Ler campanhas e anúncios
      'business_management', // Acessar Business Manager
    ].join(',');

    const authUrl = new URL('https://www.facebook.com/v21.0/dialog/oauth');
    authUrl.searchParams.set('client_id', appId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('response_type', 'code');

    // Redirecionar para Meta
    window.location.href = authUrl.toString();
  };

  // Desconectar Meta
  const handleDisconnect = async () => {
    if (!confirm('Tem certeza que deseja desconectar sua conta Meta?')) {
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('meta-disconnect');

      if (error) throw error;

      setConnectionStatus({ connected: false });
      toast.success('Meta Ads desconectado com sucesso');
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error('Erro ao desconectar Meta Ads');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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
            <CardTitle className="text-2xl font-bold">
              {connectionStatus.connected ? 'Meta Ads Conectado' : 'Conectar Meta Ads'}
            </CardTitle>
            <CardDescription>
              {connectionStatus.connected
                ? 'Sua conta está conectada. Agora você pode fazer perguntas sobre suas campanhas no WhatsApp!'
                : 'Conecte sua conta do Meta Ads para usar o agente de IA'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {connectionStatus.connected ? (
              <>
                {/* Status de Conexão */}
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-green-900">
                        Conectado como {connectionStatus.meta_user_name}
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        Token válido até {new Date(connectionStatus.expires_at!).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Como Usar */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg space-y-3">
                  <p className="font-medium text-blue-900">Como usar o Agente de IA:</p>
                  <ol className="space-y-2 text-sm text-blue-800 list-decimal list-inside">
                    <li>Envie uma mensagem para o WhatsApp do MetaAura</li>
                    <li>Faça perguntas sobre suas campanhas, ex: "Quais campanhas estão ativas?"</li>
                    <li>O agente irá buscar os dados em tempo real e responder</li>
                  </ol>
                </div>

                {/* Exemplos de Perguntas */}
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <p className="font-medium">Exemplos de perguntas:</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      "Quais são minhas campanhas ativas?"
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      "Quanto gastei nos últimos 7 dias?"
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      "Qual campanha tem melhor CTR?"
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      "Mostre o desempenho da campanha X"
                    </li>
                  </ul>
                </div>

                {/* Botão de Desconectar */}
                <Button
                  onClick={handleDisconnect}
                  variant="outline"
                  className="w-full"
                >
                  Desconectar Meta Ads
                </Button>
              </>
            ) : (
              <>
                {/* Informações sobre Permissões */}
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <p className="font-medium">O que será acessado:</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Dados de campanhas (nome, status, orçamento)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Métricas de performance (impressões, cliques, gastos)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Informações de contas de anúncios
                    </li>
                  </ul>
                </div>

                {/* Nota sobre Dados Sob Demanda */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-900 font-medium">
                        Dados sob demanda
                      </p>
                      <p className="text-sm text-blue-800 mt-1">
                        Seus dados são buscados apenas quando você faz uma pergunta no WhatsApp.
                        Não fazemos sincronizações automáticas.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Nota de Segurança */}
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <p className="text-sm text-green-900">
                    <strong>Segurança:</strong> Seus dados são criptografados e protegidos.
                    O acesso pode ser revogado a qualquer momento.
                  </p>
                </div>

                {/* Botão de Conectar */}
                <Button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="w-full bg-[#46CCC6] hover:bg-[#46CCC6]/90 text-black font-semibold"
                  size="lg"
                >
                  {isConnecting ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Facebook className="w-5 h-5 mr-2" />
                      Conectar com Meta
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConnectMeta;
```

### 4.3 Criar: MetaCallback.tsx

```typescript
// src/pages/MetaCallback.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { toast } from 'sonner';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MetaCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const errorReason = urlParams.get('error_reason');

        // Validar state (CSRF protection)
        const savedState = localStorage.getItem('meta_oauth_state');
        if (state !== savedState) {
          setError('Falha na validação de segurança. Tente novamente.');
          return;
        }
        localStorage.removeItem('meta_oauth_state');

        // Verificar erros do Meta
        if (errorReason) {
          const errorDesc = urlParams.get('error_description') || 'Erro desconhecido';
          setError(`Erro ao conectar: ${errorDesc}`);
          return;
        }

        if (!code) {
          setError('Código de autorização não recebido');
          return;
        }

        // Chamar Edge Function para processar autenticação
        const { data, error: functionError } = await supabase.functions.invoke(
          'meta-auth-callback',
          {
            body: {
              code,
              redirect_uri: import.meta.env.VITE_META_REDIRECT_URI
            },
          }
        );

        if (functionError) {
          console.error('Function error:', functionError);
          setError('Erro ao processar autenticação. Tente novamente.');
          return;
        }

        if (!data?.success) {
          setError(data?.error || 'Erro desconhecido');
          return;
        }

        toast.success('Meta Ads conectado com sucesso!');
        navigate('/connect/meta');
      } catch (err) {
        console.error('Callback error:', err);
        setError('Erro inesperado. Tente novamente.');
      }
    };

    processCallback();
  }, [navigate]);

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
            Erro na Autenticação
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            onClick={() => navigate('/connect/meta')}
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
          Conectando sua conta Meta...
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Aguarde alguns instantes
        </p>
      </div>
    </div>
  );
};

export default MetaCallback;
```

**Adicionar rota em `App.tsx`:**

```typescript
import MetaCallback from '@/pages/MetaCallback';

// Dentro das rotas:
<Route path="/meta/callback" element={<MetaCallback />} />
```

---

## 5. Implementação Backend (Supabase Edge Functions)

### 5.1 Edge Function: meta-auth-callback

**Criar arquivo:** `supabase/functions/meta-auth-callback/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface MetaUserInfo {
  id: string;
  name: string;
  email?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { code, redirect_uri } = await req.json();

    if (!code) {
      throw new Error('Authorization code is required');
    }

    console.log('Processing OAuth callback with code:', code);

    // 1. Trocar código por access_token
    const tokenUrl = new URL('https://graph.facebook.com/v21.0/oauth/access_token');
    tokenUrl.searchParams.set('client_id', Deno.env.get('META_APP_ID')!);
    tokenUrl.searchParams.set('client_secret', Deno.env.get('META_APP_SECRET')!);
    tokenUrl.searchParams.set('redirect_uri', redirect_uri);
    tokenUrl.searchParams.set('code', code);

    const tokenResponse = await fetch(tokenUrl.toString());
    const tokenData: TokenResponse = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Failed to exchange code:', tokenData);
      throw new Error(`Failed to exchange code: ${JSON.stringify(tokenData)}`);
    }

    console.log('Token obtained successfully');

    // 2. Obter informações do usuário Meta
    const meUrl = new URL('https://graph.facebook.com/v21.0/me');
    meUrl.searchParams.set('fields', 'id,name,email');
    meUrl.searchParams.set('access_token', tokenData.access_token);

    const meResponse = await fetch(meUrl.toString());
    const userData: MetaUserInfo = await meResponse.json();

    if (!meResponse.ok) {
      console.error('Failed to fetch user info:', userData);
      throw new Error('Failed to fetch user info');
    }

    console.log('User info fetched:', userData.name);

    // 3. Trocar por token de longa duração (60 dias)
    const longLivedUrl = new URL('https://graph.facebook.com/v21.0/oauth/access_token');
    longLivedUrl.searchParams.set('grant_type', 'fb_exchange_token');
    longLivedUrl.searchParams.set('client_id', Deno.env.get('META_APP_ID')!);
    longLivedUrl.searchParams.set('client_secret', Deno.env.get('META_APP_SECRET')!);
    longLivedUrl.searchParams.set('fb_exchange_token', tokenData.access_token);

    const longLivedResponse = await fetch(longLivedUrl.toString());
    const longLivedData: TokenResponse = await longLivedResponse.json();

    if (!longLivedResponse.ok) {
      console.error('Failed to get long-lived token:', longLivedData);
      throw new Error('Failed to get long-lived token');
    }

    console.log('Long-lived token obtained');

    // 4. Salvar no banco de dados
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

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + longLivedData.expires_in);

    // Inserir ou atualizar conexão Meta
    const { error: dbError } = await supabaseClient
      .from('meta_connections')
      .upsert({
        user_id: user.id,
        meta_user_id: userData.id,
        meta_user_name: userData.name,
        access_token: longLivedData.access_token,
        token_type: longLivedData.token_type,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    // Atualizar flag meta_connected na tabela subscribers
    const { error: profileError } = await supabaseClient
      .from('subscribers')
      .update({ meta_connected: true })
      .eq('user_id', user.id);

    if (profileError) {
      console.error('Profile update error:', profileError);
      throw profileError;
    }

    console.log('Connection saved successfully for user:', user.id);

    return new Response(
      JSON.stringify({
        success: true,
        meta_user: {
          id: userData.id,
          name: userData.name,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in meta-auth-callback:', error);
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

### 5.2 Edge Function: meta-disconnect

**Criar arquivo:** `supabase/functions/meta-disconnect/index.ts`

```typescript
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

    // Remover conexão
    const { error: deleteError } = await supabaseClient
      .from('meta_connections')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      throw deleteError;
    }

    // Atualizar flag
    const { error: updateError } = await supabaseClient
      .from('subscribers')
      .update({ meta_connected: false })
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
    console.error('Error in meta-disconnect:', error);
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

### 5.3 Edge Function: meta-get-token (Para MCP Server)

Esta função será chamada pelo MCP Server do parceiro para obter o token do usuário.

**Criar arquivo:** `supabase/functions/meta-get-token/index.ts`

```typescript
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

    // Buscar conexão Meta do usuário
    const { data: connection, error: fetchError } = await supabaseClient
      .from('meta_connections')
      .select('access_token, expires_at, meta_user_id, meta_user_name')
      .eq('user_id', user.id)
      .single();

    if (fetchError || !connection) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Meta connection not found',
          code: 'NOT_CONNECTED',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    // Verificar se token está próximo de expirar (menos de 7 dias)
    const expiresAt = new Date(connection.expires_at);
    const now = new Date();
    const daysUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    return new Response(
      JSON.stringify({
        success: true,
        access_token: connection.access_token,
        expires_at: connection.expires_at,
        meta_user_id: connection.meta_user_id,
        meta_user_name: connection.meta_user_name,
        needs_refresh: daysUntilExpiry < 7,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in meta-get-token:', error);
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

### 5.4 Configurar Secrets no Supabase

```bash
# Via Supabase CLI
supabase secrets set META_APP_ID=seu_app_id_aqui
supabase secrets set META_APP_SECRET=seu_app_secret_aqui

# Ou via Dashboard: Settings → Edge Functions → Secrets
```

---

## 6. Integração com MCP Server do Parceiro

### 6.1 Arquitetura da Comunicação

```
┌─────────────────────────────────────────────────────────────────┐
│                    Fluxo MCP Request                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Usuário: "Quais campanhas estão ativas?"                    │
│      │                                                            │
│      ▼                                                            │
│  2. WhatsApp → Evolution API → N8N                               │
│      │                                                            │
│      ▼                                                            │
│  3. N8N → Claude AI Agent                                        │
│      │                                                            │
│      ▼                                                            │
│  4. Claude identifica que precisa de dados do Meta               │
│      │                                                            │
│      ▼                                                            │
│  5. Claude chama MCP Server (parceiro)                           │
│     Tool: "list_campaigns"                                       │
│     Params: { user_id: "xxx", status: "ACTIVE" }                │
│      │                                                            │
│      ▼                                                            │
│  6. MCP Server chama nossa Edge Function                         │
│     GET /meta-get-token                                          │
│     Headers: { Authorization: "Bearer user_token" }              │
│      │                                                            │
│      ▼                                                            │
│  7. Edge Function retorna access_token                           │
│      │                                                            │
│      ▼                                                            │
│  8. MCP Server chama Meta Graph API                              │
│     GET /act_xxx/campaigns?access_token=yyy                      │
│      │                                                            │
│      ▼                                                            │
│  9. Meta API retorna dados de campanhas                          │
│      │                                                            │
│      ▼                                                            │
│ 10. MCP Server formata e retorna para Claude                     │
│      │                                                            │
│      ▼                                                            │
│ 11. Claude processa e gera resposta natural                      │
│      │                                                            │
│      ▼                                                            │
│ 12. Resposta enviada para usuário via WhatsApp                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Especificação das Tools do MCP Server

O MCP Server do parceiro deve expor as seguintes ferramentas (tools):

#### Tool 1: list_ad_accounts

**Descrição:** Lista todas as contas de anúncios do usuário

**Parâmetros:**
```json
{
  "user_id": "string (required)",
  "fields": "string (optional, default: id,name,currency,account_status)"
}
```

**Retorno:**
```json
{
  "success": true,
  "data": [
    {
      "id": "act_123456789",
      "name": "Minha Empresa",
      "currency": "BRL",
      "account_status": "ACTIVE"
    }
  ]
}
```

**Chamada Meta API:**
```
GET https://graph.facebook.com/v21.0/me/adaccounts
  ?fields={fields}
  &access_token={token}
```

---

#### Tool 2: list_campaigns

**Descrição:** Lista campanhas de uma conta de anúncios

**Parâmetros:**
```json
{
  "user_id": "string (required)",
  "ad_account_id": "string (required)",
  "status": "string (optional: ACTIVE, PAUSED, ALL)",
  "fields": "string (optional)",
  "limit": "number (optional, default: 25)"
}
```

**Retorno:**
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
      "effective_status": "ACTIVE"
    }
  ],
  "count": 1
}
```

**Chamada Meta API:**
```
GET https://graph.facebook.com/v21.0/{ad_account_id}/campaigns
  ?fields={fields}
  &filtering=[{"field":"effective_status","operator":"IN","value":["ACTIVE"]}]
  &limit={limit}
  &access_token={token}
```

---

#### Tool 3: get_campaign_insights

**Descrição:** Obtém métricas de uma campanha específica

**Parâmetros:**
```json
{
  "user_id": "string (required)",
  "campaign_id": "string (required)",
  "date_preset": "string (optional: today, yesterday, last_7d, last_30d)",
  "time_range": "object (optional: {since, until})",
  "fields": "string (optional)"
}
```

**Retorno:**
```json
{
  "success": true,
  "data": {
    "campaign_id": "120212345678901234",
    "campaign_name": "Campanha Black Friday",
    "impressions": "125000",
    "clicks": "4500",
    "spend": "8500.50",
    "ctr": "3.6",
    "cpc": "1.89",
    "conversions": "85",
    "date_start": "2024-11-01",
    "date_stop": "2024-11-04"
  }
}
```

**Chamada Meta API:**
```
GET https://graph.facebook.com/v21.0/{campaign_id}/insights
  ?fields={fields}
  &date_preset={date_preset}
  &access_token={token}
```

---

#### Tool 4: get_account_insights

**Descrição:** Obtém métricas consolidadas de uma conta

**Parâmetros:**
```json
{
  "user_id": "string (required)",
  "ad_account_id": "string (required)",
  "date_preset": "string (optional)",
  "level": "string (optional: account, campaign, adset, ad)",
  "breakdowns": "array (optional: age, gender, country, etc)"
}
```

**Retorno:**
```json
{
  "success": true,
  "data": {
    "account_id": "act_123456789",
    "date_start": "2024-10-28",
    "date_stop": "2024-11-04",
    "impressions": "450000",
    "clicks": "18500",
    "spend": "35250.75",
    "conversions": "342",
    "roas": "4.25"
  }
}
```

---

#### Tool 5: search_campaigns

**Descrição:** Busca campanhas por nome ou palavra-chave

**Parâmetros:**
```json
{
  "user_id": "string (required)",
  "ad_account_id": "string (required)",
  "query": "string (required)",
  "limit": "number (optional, default: 10)"
}
```

**Retorno:**
```json
{
  "success": true,
  "data": [
    {
      "id": "120212345678901234",
      "name": "Black Friday 2024",
      "status": "ACTIVE",
      "relevance_score": 0.95
    }
  ],
  "count": 1
}
```

---

### 6.3 Autenticação MCP Server → Supabase

O MCP Server do parceiro precisa se autenticar com nossa API para obter tokens:

**Opção 1: Service Role Key (Recomendado)**

O parceiro recebe uma **Service Role Key** do Supabase com permissões limitadas:

```typescript
// No MCP Server (parceiro)
const supabaseClient = createClient(
  'https://sua-url.supabase.co',
  'service-role-key-limitada'
);

// Buscar token do usuário
const { data } = await supabaseClient
  .from('meta_connections')
  .select('access_token')
  .eq('meta_user_id', metaUserId) // Identificar por meta_user_id
  .single();
```

**Opção 2: API Key do Parceiro**

Criar sistema de API Keys para o parceiro:

```sql
-- Tabela de API Keys
CREATE TABLE public.mcp_partner_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_name TEXT NOT NULL,
  api_key TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir chave do parceiro
INSERT INTO public.mcp_partner_keys (partner_name, api_key)
VALUES ('Partner MCP Server', 'mcp_key_xxxxxxxxxx');
```

**Edge Function validaria:**

```typescript
const apiKey = req.headers.get('X-API-Key');

const { data: partner } = await supabaseClient
  .from('mcp_partner_keys')
  .select('*')
  .eq('api_key', apiKey)
  .eq('is_active', true)
  .single();

if (!partner) {
  throw new Error('Invalid API key');
}
```

### 6.4 Formato de Requisição MCP

**Exemplo de chamada do Claude AI para o MCP Server:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "list_campaigns",
    "arguments": {
      "user_id": "user-uuid-from-whatsapp",
      "ad_account_id": "act_123456789",
      "status": "ACTIVE",
      "limit": 10
    }
  }
}
```

**Resposta do MCP Server:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Encontrei 3 campanhas ativas:\n\n1. **Black Friday 2024**\n   - Status: Ativa\n   - Orçamento diário: R$ 100,00\n   - Gastos hoje: R$ 45,32\n\n2. **Cyber Monday Preparação**\n   - Status: Ativa\n   - Orçamento diário: R$ 150,00\n   - Gastos hoje: R$ 89,15\n\n3. **Remarketing Geral**\n   - Status: Ativa\n   - Orçamento diário: R$ 50,00\n   - Gastos hoje: R$ 23,87"
      }
    ]
  }
}
```

---

## 7. Fluxo N8N + WhatsApp + Claude AI

### 7.1 Workflow N8N Simplificado

```
┌─────────────────┐
│  1. Webhook     │  ← Recebe mensagem do WhatsApp via Evolution API
│  (WhatsApp In)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  2. Function    │  ← Extrai user_id, phone, mensagem
│  (Parse Data)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  3. Supabase    │  ← Busca usuário pelo whatsapp_phone
│  (Get User)     │     Retorna: user_id, meta_connected
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  4. IF Node     │  ← Verifica se meta_connected == true
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌───────────────┐
│ FALSE │ │  TRUE         │
└───┬───┘ └───┬───────────┘
    │         │
    │         ▼
    │   ┌─────────────────┐
    │   │  5. Claude AI   │  ← Envia mensagem + contexto do usuário
    │   │  (MCP Enabled)  │     Claude pode chamar MCP tools
    │   └────────┬────────┘
    │            │
    │            ▼
    │   ┌─────────────────┐
    │   │  6. Function    │  ← Formata resposta do Claude
    │   │  (Format)       │
    │   └────────┬────────┘
    │            │
    ▼            ▼
┌─────────────────┐
│  7. HTTP        │  ← Envia resposta para WhatsApp via Evolution API
│  (WhatsApp Out) │
└─────────────────┘
```

### 7.2 Configuração do Claude AI Node no N8N

**Parâmetros importantes:**

```json
{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 2048,
  "system": "Você é um assistente de marketing digital especializado em Meta Ads. Ajude o usuário com informações sobre suas campanhas de forma clara e objetiva.",
  "tools": [
    {
      "name": "mcp://partner-meta-server/list_campaigns",
      "description": "Lista campanhas do Meta Ads do usuário"
    },
    {
      "name": "mcp://partner-meta-server/get_campaign_insights",
      "description": "Obtém métricas detalhadas de uma campanha"
    },
    {
      "name": "mcp://partner-meta-server/get_account_insights",
      "description": "Obtém métricas consolidadas da conta"
    }
  ],
  "user_context": {
    "user_id": "{{ $json.user_id }}",
    "phone": "{{ $json.phone }}",
    "meta_connected": true
  }
}
```

### 7.3 Identificação do Usuário

**Importante:** O N8N precisa mapear o número de WhatsApp para o user_id do Supabase.

**Query Supabase:**

```typescript
// No N8N - Supabase Node
const { data: user } = await supabase
  .from('subscribers')
  .select('id, user_id, meta_connected')
  .eq('whatsapp_phone', phoneNumber)
  .single();

if (!user || !user.meta_connected) {
  return {
    message: "Você precisa conectar sua conta Meta Ads primeiro. Acesse: https://app.metaaura.com/connect/meta"
  };
}

// Passar user_id para o Claude AI
return {
  user_id: user.user_id,
  phone: phoneNumber,
  meta_connected: true
};
```

---

## 8. Renovação Automática de Tokens

### 8.1 Edge Function: meta-refresh-token

**Criar arquivo:** `supabase/functions/meta-refresh-token/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar tokens que expiram em menos de 7 dias
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const { data: connections, error: fetchError } = await supabaseClient
      .from('meta_connections')
      .select('*')
      .lt('expires_at', sevenDaysFromNow.toISOString());

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Found ${connections.length} tokens to refresh`);

    let refreshedCount = 0;
    let failedCount = 0;

    for (const connection of connections) {
      try {
        // Trocar por novo token de longa duração
        const refreshUrl = new URL('https://graph.facebook.com/v21.0/oauth/access_token');
        refreshUrl.searchParams.set('grant_type', 'fb_exchange_token');
        refreshUrl.searchParams.set('client_id', Deno.env.get('META_APP_ID')!);
        refreshUrl.searchParams.set('client_secret', Deno.env.get('META_APP_SECRET')!);
        refreshUrl.searchParams.set('fb_exchange_token', connection.access_token);

        const response = await fetch(refreshUrl.toString());
        const data = await response.json();

        if (!response.ok) {
          console.error(`Failed to refresh token for user ${connection.user_id}:`, data);
          failedCount++;
          continue;
        }

        // Atualizar no banco
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + data.expires_in);

        await supabaseClient
          .from('meta_connections')
          .update({
            access_token: data.access_token,
            expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', connection.user_id);

        refreshedCount++;
        console.log(`Token refreshed successfully for user ${connection.user_id}`);
      } catch (error) {
        console.error(`Error refreshing token for user ${connection.user_id}:`, error);
        failedCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        refreshed: refreshedCount,
        failed: failedCount,
        total: connections.length,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in meta-refresh-token:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
```

### 8.2 Cron Job para Executar Refresh

**Opção 1: GitHub Actions**

```yaml
# .github/workflows/refresh-meta-tokens.yml
name: Refresh Meta Tokens

on:
  schedule:
    - cron: '0 3 * * *' # Diariamente às 3h UTC
  workflow_dispatch:

jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - name: Call Refresh Function
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            https://sua-url.supabase.co/functions/v1/meta-refresh-token
```

**Opção 2: Serviço de Cron Externo (cron-job.org, EasyCron)**

- URL: `https://sua-url.supabase.co/functions/v1/meta-refresh-token`
- Método: POST
- Headers: `Authorization: Bearer {service_role_key}`
- Frequência: Diária

---

## 9. Segurança e Boas Práticas

### 9.1 Checklist de Segurança

- [x] **Tokens armazenados no banco com RLS**
- [x] **Validação de state (CSRF) no OAuth**
- [x] **HTTPS em todos endpoints**
- [x] **Service role key protegida (variável de ambiente)**
- [x] **Usuário só acessa seus próprios dados (RLS)**
- [ ] **Rate limiting nas Edge Functions** (implementar se necessário)
- [x] **Logs de auditoria** (tabela mcp_audit_logs)
- [x] **Renovação automática de tokens**
- [x] **Limpeza de tokens expirados**

### 9.2 Monitoramento

**Logs importantes a monitorar:**

1. Falhas de autenticação OAuth
2. Tokens expirados não renovados
3. Erros nas chamadas do MCP Server
4. Rate limits atingidos na Meta API
5. Usuários com conexão perdida

**Criar alertas para:**
- Taxa de erro > 5% nas Edge Functions
- Tokens expirados não renovados > 10
- Chamadas falhando consistentemente para um usuário

---

## 10. Testes

### 10.1 Checklist de Testes

**Autenticação:**
- [ ] OAuth flow completo funciona
- [ ] Callback processa código corretamente
- [ ] Tokens são salvos no banco
- [ ] Flag `meta_connected` é atualizado
- [ ] Erro de CSRF é detectado
- [ ] Erro do Meta é tratado

**MCP Server (Parceiro deve testar):**
- [ ] Tool `list_ad_accounts` retorna contas
- [ ] Tool `list_campaigns` retorna campanhas filtradas
- [ ] Tool `get_campaign_insights` retorna métricas
- [ ] Tool `get_account_insights` retorna agregados
- [ ] Tool `search_campaigns` busca por nome
- [ ] Autenticação com Supabase funciona
- [ ] Erros da Meta API são tratados

**Integração WhatsApp:**
- [ ] Usuário consegue fazer pergunta no WhatsApp
- [ ] N8N identifica usuário corretamente
- [ ] Claude AI recebe contexto adequado
- [ ] MCP tools são chamadas quando necessário
- [ ] Resposta é formatada corretamente
- [ ] Resposta chega no WhatsApp do usuário

**Renovação de Token:**
- [ ] Cron job executa diariamente
- [ ] Tokens próximos de expirar são renovados
- [ ] Falhas são logadas
- [ ] Usuários são notificados se necessário

---

## 11. Configuração Passo a Passo

### Passo 1: Registrar App no Meta Developers

1. Acesse https://developers.facebook.com/apps/
2. Criar novo app → Tipo: Negócios
3. Adicionar produtos:
   - Facebook Login
   - Marketing API
4. Configurar URLs:
   - Domínio: `seu-dominio.com`
   - OAuth Redirect: `https://seu-dominio.com/meta/callback`
5. Anotar:
   - App ID
   - App Secret

### Passo 2: Configurar Variáveis de Ambiente

**Frontend (.env):**
```bash
VITE_META_APP_ID=seu_app_id
VITE_META_REDIRECT_URI=https://seu-dominio.com/meta/callback
```

**Supabase (Secrets):**
```bash
supabase secrets set META_APP_ID=seu_app_id
supabase secrets set META_APP_SECRET=seu_app_secret
```

### Passo 3: Criar Tabelas no Banco

```bash
# Criar migration
supabase migration new create_meta_connections

# Copiar SQL da seção 3.1 para o arquivo gerado
# Executar migration
supabase db push
```

### Passo 4: Deploy Edge Functions

```bash
# Deploy todas as Edge Functions
supabase functions deploy meta-auth-callback
supabase functions deploy meta-disconnect
supabase functions deploy meta-get-token
supabase functions deploy meta-refresh-token
```

### Passo 5: Atualizar Frontend

1. Criar `MetaCallback.tsx`
2. Atualizar `ConnectMeta.tsx`
3. Adicionar rota no `App.tsx`
4. Deploy do frontend

### Passo 6: Configurar Parceiro MCP

1. Fornecer endpoint: `https://sua-url.supabase.co/functions/v1/meta-get-token`
2. Fornecer Service Role Key (limitada) ou API Key
3. Documentar tools esperadas (seção 6.2)
4. Testar integração

### Passo 7: Configurar N8N

1. Criar workflow conforme seção 7.1
2. Configurar Claude AI node com MCP tools
3. Configurar identificação de usuário
4. Testar fluxo completo

### Passo 8: Configurar Cron Job

1. Escolher método (GitHub Actions ou externo)
2. Configurar para executar diariamente
3. Testar execução manual

### Passo 9: Solicitar Review do Meta

1. Preparar vídeo demonstrativo
2. Submeter para review das permissões
3. Aguardar aprovação (3-7 dias)

---

## 12. Troubleshooting

### Problema: "Invalid OAuth access token"

**Causa:** Token expirado ou inválido

**Solução:**
1. Verificar data de expiração no banco
2. Executar `meta-refresh-token` manualmente
3. Se falhar, usuário deve reautenticar

### Problema: MCP Server não consegue acessar token

**Causa:** Autenticação falhando

**Solução:**
1. Verificar se API Key/Service Role Key está correta
2. Verificar se usuário tem `meta_connected = true`
3. Verificar logs da Edge Function `meta-get-token`

### Problema: Claude AI não chama MCP tools

**Causa:** Configuração incorreta do MCP no N8N

**Solução:**
1. Verificar se tools estão registradas corretamente
2. Verificar se contexto do usuário está sendo passado
3. Testar prompt: "Liste minhas campanhas ativas" (deve forçar chamada)

### Problema: Erro 190 da Meta API

**Causa:** Token inválido, expirado ou revogado

**Solução:**
1. Verificar se token não foi revogado pelo usuário
2. Renovar token
3. Se persistir, solicitar reautenticação

---

## 13. Recursos e Referências

### Documentação Oficial

- **Meta for Developers:** https://developers.facebook.com/
- **Marketing API:** https://developers.facebook.com/docs/marketing-apis
- **Graph API:** https://developers.facebook.com/docs/graph-api
- **OAuth Manual Flow:** https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow
- **MCP Protocol (Anthropic):** https://github.com/anthropics/mcp

### Ferramentas

- **Graph API Explorer:** https://developers.facebook.com/tools/explorer/
- **Access Token Debugger:** https://developers.facebook.com/tools/debug/accesstoken/
- **Supabase Dashboard:** https://app.supabase.com/

### Endpoints Úteis

```bash
# Testar Edge Function localmente
supabase functions serve meta-auth-callback

# Verificar logs
supabase functions logs meta-auth-callback

# Executar migration
supabase db push

# Ver status das secrets
supabase secrets list
```

---

## 14. Roadmap de Implementação

### Fase 1: Setup Básico (Semana 1)
- [x] Documentação completa
- [ ] Registrar app no Meta Developers
- [ ] Criar tabelas no banco
- [ ] Deploy Edge Functions básicas
- [ ] Configurar variáveis de ambiente

### Fase 2: Autenticação (Semana 1-2)
- [ ] Implementar frontend (ConnectMeta + Callback)
- [ ] Testar OAuth flow completo
- [ ] Implementar desconexão
- [ ] Testar renovação de token

### Fase 3: Integração MCP (Semana 2-3)
- [ ] Integrar com MCP Server do parceiro
- [ ] Implementar `meta-get-token` para parceiro
- [ ] Testar chamadas das tools
- [ ] Documentar para o parceiro

### Fase 4: WhatsApp + N8N (Semana 3-4)
- [ ] Configurar workflow N8N
- [ ] Integrar Claude AI com MCP
- [ ] Testar identificação de usuário
- [ ] Testar fluxo completo end-to-end

### Fase 5: Produção (Semana 4-5)
- [ ] Deploy em produção
- [ ] Configurar cron jobs
- [ ] Implementar monitoramento
- [ ] Solicitar review do Meta
- [ ] Treinar usuários

### Fase 6: Otimizações (Futuro)
- [ ] Cache de respostas frequentes
- [ ] Logs e analytics detalhados
- [ ] Alertas automáticos para usuários
- [ ] Dashboard de métricas agregadas
- [ ] Webhooks do Meta (realtime)

---

## 15. Glossário

| Termo | Definição |
|-------|-----------|
| **MCP** | Model Context Protocol - protocolo da Anthropic para conectar IA a dados externos |
| **OAuth 2.0** | Protocolo de autorização usado pelo Meta |
| **Access Token** | Token de autenticação para Graph API (validade: 60 dias) |
| **Graph API** | API principal do Meta para acesso a dados |
| **Edge Function** | Função serverless no Supabase (Deno runtime) |
| **RLS** | Row Level Security - segurança em nível de linha |
| **Evolution API** | API open-source para integração WhatsApp |
| **N8N** | Plataforma de automação workflow (similar ao Zapier) |
| **Tool (MCP)** | Ferramenta exposta pelo MCP Server que o AI pode chamar |
| **CSRF** | Cross-Site Request Forgery - ataque prevenido pelo state parameter |

---

## Contato e Suporte

**Desenvolvedor:** Paulo
**Projeto:** MetaAura - ChatData
**Versão:** 2.0.0 (Arquitetura MCP)
**Data:** 04/11/2024

---

## Changelog

### v2.0.0 - 04/11/2024
- ✅ Revisão completa da arquitetura para MCP
- ✅ Foco em dados sob demanda (não sincronização)
- ✅ Especificação de integração com MCP Server do parceiro
- ✅ Documentação de tools do MCP
- ✅ Fluxo WhatsApp → N8N → Claude AI → MCP
- ✅ Simplificação do banco de dados (apenas tokens)
- ✅ Edge Functions otimizadas para MCP
- ❌ Removido: sincronização periódica, cache de campanhas

### v1.0.0 - 04/11/2024
- Documentação inicial (arquitetura tradicional)
