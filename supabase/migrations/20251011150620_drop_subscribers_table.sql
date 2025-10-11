-- Drop subscribers table if it exists (this table is not being used anymore)
-- The profiles table is the one being used for user subscriptions
DROP TABLE IF EXISTS public.subscribers CASCADE;
