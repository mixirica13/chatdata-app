-- Remove UNIQUE constraint from email column in subscribers table
-- This allows multiple webhook calls with the same email but different user_id
-- The user_id remains the unique key for upsert operations

ALTER TABLE public.subscribers DROP CONSTRAINT IF EXISTS subscribers_email_key;

-- Also remove unique constraint from stripe_customer_id if it causes issues
-- (keeping it commented for now, uncomment if needed)
-- ALTER TABLE public.subscribers DROP CONSTRAINT IF EXISTS subscribers_stripe_customer_id_key;
