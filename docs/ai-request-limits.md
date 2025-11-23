# Sistema de Limite de Requisições AI - Documentação

## Visão Geral

Sistema simples de rate limiting que reseta o contador `ai_requests_count` de todos os usuários automaticamente a cada 24 horas (meia-noite, horário de Brasília).

## Como Funciona

### 1. **Coluna de Contador**
- `subscribers.ai_requests_count` - Contador de requisições do dia atual
- Reseta automaticamente para `0` todo dia à meia-noite

### 2. **Reset Automático**
- **Cron Job**: Roda automaticamente todo dia às **00:00** (horário de Brasília)
- **Função**: `reset_daily_ai_requests()` - Reseta todos os contadores para 0

### 3. **Limites por Tier**
- **Free**: 10 requests/dia
- **Basic**: 50 requests/dia
- **Pro**: 100 requests/dia
- **Agency**: Ilimitado (999999 requests/dia)

#### Legacy (compatibilidade com planos antigos):
- **Starter**: 500 requests/dia
- **Professional**: 2000 requests/dia
- **Enterprise**: Ilimitado (999999)

## Integração com n8n

### Exemplo de Workflow

```javascript
// 1. Buscar usuário pelo WhatsApp
const subscriber = await supabase
  .from('subscribers')
  .select('ai_requests_count, ai_requests_limit')
  .eq('whatsapp_phone', phoneNumber)
  .single();

// 2. Verificar se atingiu o limite
if (subscriber.ai_requests_limit !== null &&
    subscriber.ai_requests_count >= subscriber.ai_requests_limit) {
  // Enviar mensagem de limite atingido
  return {
    success: false,
    message: 'Você atingiu o limite diário de mensagens. Tente novamente amanhã!'
  };
}

// 3. Incrementar contador
await supabase
  .from('subscribers')
  .update({
    ai_requests_count: subscriber.ai_requests_count + 1
  })
  .eq('whatsapp_phone', phoneNumber);

// 4. Processar mensagem com AI agent
// ... seu código aqui
```

### SQL Direto (alternativa)

```sql
-- Verificar status atual do usuário
SELECT
  ai_requests_count,
  ai_requests_limit,
  CASE
    WHEN ai_requests_limit IS NULL THEN 'unlimited'
    WHEN ai_requests_count >= ai_requests_limit THEN 'limit_reached'
    ELSE 'available'
  END as status
FROM subscribers
WHERE whatsapp_phone = '+5511999999999';

-- Incrementar contador
UPDATE subscribers
SET ai_requests_count = ai_requests_count + 1
WHERE whatsapp_phone = '+5511999999999';
```

## Monitoramento

### Ver status do Cron Job
```sql
-- Listar jobs agendados
SELECT * FROM cron.job;

-- Ver execuções recentes
SELECT * FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 10;
```

### Testar reset manual
```sql
-- Executar reset manualmente (para testes)
SELECT reset_daily_ai_requests();
```

## Notas Importantes

- ✅ Reset automático todo dia à meia-noite (horário de Brasília)
- ✅ Usuários Enterprise têm `ai_requests_limit = NULL` (ilimitado)
- ✅ O contador só reseta usuários que têm `ai_requests_count > 0` (otimização)
- ⚠️ Fuso horário: O cron roda às 03:00 UTC = 00:00 BRT (horário de Brasília)

## Troubleshooting

### Verificar se o cron está rodando
```sql
SELECT
  jobname,
  schedule,
  active,
  database
FROM cron.job
WHERE jobname = 'reset-ai-requests-daily';
```

### Ver logs de execução
```sql
SELECT
  runid,
  start_time,
  end_time,
  status,
  return_message
FROM cron.job_run_details
WHERE jobname = 'reset-ai-requests-daily'
ORDER BY start_time DESC
LIMIT 5;
```
