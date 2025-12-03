-- Create mcp_tokens table for storing MCP authentication tokens
CREATE TABLE IF NOT EXISTS mcp_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mcp_token TEXT UNIQUE NOT NULL,
  meta_access_token TEXT NOT NULL,
  meta_token_expires_at TIMESTAMPTZ NOT NULL,
  meta_user_id TEXT NOT NULL,
  meta_user_name TEXT NOT NULL,
  ad_account_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_mcp_tokens_mcp_token ON mcp_tokens(mcp_token);
CREATE INDEX IF NOT EXISTS idx_mcp_tokens_user_id ON mcp_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_mcp_tokens_meta_user_id ON mcp_tokens(meta_user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_mcp_tokens_updated_at BEFORE UPDATE ON mcp_tokens
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE mcp_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own tokens
CREATE POLICY "Users can view own tokens"
  ON mcp_tokens FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own tokens
CREATE POLICY "Users can insert own tokens"
  ON mcp_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own tokens
CREATE POLICY "Users can update own tokens"
  ON mcp_tokens FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own tokens
CREATE POLICY "Users can delete own tokens"
  ON mcp_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- Grant access to service role (for server-side operations)
GRANT ALL ON mcp_tokens TO service_role;

-- Comments for documentation
COMMENT ON TABLE mcp_tokens IS 'Stores MCP authentication tokens and Meta API credentials for users';
COMMENT ON COLUMN mcp_tokens.mcp_token IS 'Unique MCP token generated for API authentication';
COMMENT ON COLUMN mcp_tokens.meta_access_token IS 'Meta/Facebook access token for Graph API';
COMMENT ON COLUMN mcp_tokens.meta_token_expires_at IS 'Expiration timestamp for Meta access token';
COMMENT ON COLUMN mcp_tokens.ad_account_ids IS 'Array of Meta ad account IDs the user has access to';
