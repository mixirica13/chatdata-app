-- ==========================================
-- Migration: Add Pre-Trial and Onboarding Support
-- Adiciona campos para controle de pre-trial (5 requisições) e onboarding interativo
-- ==========================================

-- Adiciona colunas de pre-trial e onboarding na tabela subscribers
ALTER TABLE subscribers
ADD COLUMN IF NOT EXISTS pre_trial_requests_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;

-- Comentários para documentação
COMMENT ON COLUMN subscribers.pre_trial_requests_count IS 'Contador de requisições AI do pre-trial (limite de 5, não reseta)';
COMMENT ON COLUMN subscribers.onboarding_completed IS 'Indica se o usuário completou o onboarding interativo';
COMMENT ON COLUMN subscribers.onboarding_step IS 'Passo atual do onboarding (0=não iniciado, 1=Facebook, 2=WhatsApp, 3=concluído)';

-- Índice para performance em queries de onboarding
CREATE INDEX IF NOT EXISTS idx_subscribers_onboarding
ON subscribers(onboarding_completed, onboarding_step);

-- Índice para queries de pre-trial
CREATE INDEX IF NOT EXISTS idx_subscribers_pretrial
ON subscribers(pre_trial_requests_count);
