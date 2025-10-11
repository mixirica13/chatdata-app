-- Create function to update timestamps (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create subscribers table for Stripe subscription management
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT UNIQUE,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create policies for subscribers table
CREATE POLICY "Users can view their own subscription"
ON public.subscribers
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
ON public.subscribers
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all subscriptions"
ON public.subscribers
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index on stripe_customer_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscribers_stripe_customer_id
ON public.subscribers(stripe_customer_id);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id
ON public.subscribers(user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_subscribers_updated_at
BEFORE UPDATE ON public.subscribers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create subscriber record when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_subscriber()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscribers (user_id, email, subscribed)
  VALUES (NEW.id, NEW.email, false)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger for automatic subscriber creation
CREATE TRIGGER on_auth_user_created_subscriber
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_subscriber();
