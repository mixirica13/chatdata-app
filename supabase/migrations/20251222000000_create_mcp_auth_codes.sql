-- Migration: Create mcp_auth_codes table
-- Purpose: Store temporary authorization codes for MCP OAuth flow
-- Codes are single-use and expire after 5 minutes

CREATE TABLE IF NOT EXISTS mcp_auth_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id TEXT,
    redirect_uri TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast code lookup
CREATE INDEX idx_mcp_auth_codes_code ON mcp_auth_codes(code);
CREATE INDEX idx_mcp_auth_codes_expires_at ON mcp_auth_codes(expires_at);

-- Enable RLS
ALTER TABLE mcp_auth_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can create their own auth codes
CREATE POLICY "Users can create own auth codes"
    ON mcp_auth_codes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Service role has full access (for exchange endpoint)
CREATE POLICY "Service role full access on mcp_auth_codes"
    ON mcp_auth_codes FOR ALL
    USING (true)
    WITH CHECK (true);

-- Auto-cleanup expired codes (optional, can be done via cron)
COMMENT ON TABLE mcp_auth_codes IS 'Temporary authorization codes for MCP OAuth flow. Codes expire after 5 minutes and are single-use.';
COMMENT ON COLUMN mcp_auth_codes.code IS 'Random 32-byte hex code';
COMMENT ON COLUMN mcp_auth_codes.used_at IS 'Timestamp when code was exchanged. NULL means not yet used.';
