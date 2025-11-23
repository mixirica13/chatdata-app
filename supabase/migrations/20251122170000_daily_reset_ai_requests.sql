-- ==========================================
-- Migration: Daily Reset AI Requests
-- Reseta o contador ai_requests_count a cada 24h
-- ==========================================

-- Habilita a extensão pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Cria a função que reseta o contador para todos os usuários
CREATE OR REPLACE FUNCTION reset_daily_ai_requests()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE subscribers
  SET ai_requests_count = 0
  WHERE ai_requests_count > 0;
END;
$$;

-- Configura o cron job para rodar todos os dias à meia-noite (horário de Brasília)
-- Nota: Cron jobs do Supabase usam UTC, então 03:00 UTC = 00:00 BRT
SELECT cron.schedule(
  'reset-ai-requests-daily',  -- nome do job
  '0 3 * * *',                -- todo dia às 03:00 UTC (00:00 horário de Brasília)
  $$SELECT reset_daily_ai_requests()$$
);

-- Comentário
COMMENT ON FUNCTION reset_daily_ai_requests() IS
'Reseta ai_requests_count para 0 para todos os usuários. Roda automaticamente todo dia à meia-noite.';
