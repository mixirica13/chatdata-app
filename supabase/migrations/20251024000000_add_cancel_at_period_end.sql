-- Add cancel_at_period_end column to subscribers table
ALTER TABLE public.subscribers
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.subscribers.cancel_at_period_end IS 'Indica se a assinatura será cancelada no final do período de cobrança';
