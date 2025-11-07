-- Create table for Meta connections
CREATE TABLE IF NOT EXISTS meta_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    meta_user_id TEXT NOT NULL,
    access_token TEXT NOT NULL, -- TODO: Should be encrypted in production
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    granted_scopes TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create table for Meta ad accounts
CREATE TABLE IF NOT EXISTS meta_ad_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id TEXT NOT NULL, -- The numeric account ID
    ad_account_id TEXT NOT NULL, -- The full ID with act_ prefix
    name TEXT NOT NULL,
    currency TEXT NOT NULL,
    business_id TEXT,
    business_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, account_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_meta_connections_user_id ON meta_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_meta_ad_accounts_user_id ON meta_ad_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_meta_ad_accounts_account_id ON meta_ad_accounts(account_id);

-- Enable Row Level Security
ALTER TABLE meta_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_ad_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies for meta_connections
CREATE POLICY "Users can view their own meta connections"
    ON meta_connections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meta connections"
    ON meta_connections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meta connections"
    ON meta_connections FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meta connections"
    ON meta_connections FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for meta_ad_accounts
CREATE POLICY "Users can view their own meta ad accounts"
    ON meta_ad_accounts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meta ad accounts"
    ON meta_ad_accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meta ad accounts"
    ON meta_ad_accounts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meta ad accounts"
    ON meta_ad_accounts FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_meta_connections_updated_at
    BEFORE UPDATE ON meta_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meta_ad_accounts_updated_at
    BEFORE UPDATE ON meta_ad_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
