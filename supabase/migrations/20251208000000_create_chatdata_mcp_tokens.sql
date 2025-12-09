-- Migration: Create chatdata_mcp_tokens table
-- Purpose: Store MCP tokens for each user, linked to their Meta credentials
-- Used by: n8n AI Agent to authenticate with MCP Server

CREATE TABLE IF NOT EXISTS chatdata_mcp_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    mcp_token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_mcp_tokens_user_id ON chatdata_mcp_tokens(user_id);
CREATE INDEX idx_mcp_tokens_token ON chatdata_mcp_tokens(mcp_token);
CREATE INDEX idx_mcp_tokens_expires_at ON chatdata_mcp_tokens(expires_at);

-- Enable RLS
ALTER TABLE chatdata_mcp_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own tokens
CREATE POLICY "Users can view own mcp tokens"
    ON chatdata_mcp_tokens FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Service role has full access (used by MCP server and Edge Functions)
-- Note: Service role bypasses RLS by default, but explicit policy for clarity
CREATE POLICY "Service role full access"
    ON chatdata_mcp_tokens FOR ALL
    USING (true)
    WITH CHECK (true);

-- Comment on table
COMMENT ON TABLE chatdata_mcp_tokens IS 'MCP authentication tokens for Meta Ads API access via n8n AI Agent';
COMMENT ON COLUMN chatdata_mcp_tokens.mcp_token IS 'Token format: mcp_ + 64 hex chars (32 bytes)';
COMMENT ON COLUMN chatdata_mcp_tokens.expires_at IS 'Matches meta_credentials.expires_at (60 days from Meta token)';
