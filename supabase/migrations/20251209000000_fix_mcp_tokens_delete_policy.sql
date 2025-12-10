-- Migration: Add DELETE policies for MCP tokens and Meta credentials
-- Purpose: Allow users to delete their own data when disconnecting Meta

-- Policy: Users can delete their own MCP tokens
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'chatdata_mcp_tokens'
        AND policyname = 'Users can delete own mcp tokens'
    ) THEN
        CREATE POLICY "Users can delete own mcp tokens"
            ON chatdata_mcp_tokens FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- Ensure meta_credentials table has DELETE policy
-- (table may have been created manually without proper policies)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'meta_credentials' AND table_schema = 'public'
    ) THEN
        -- Check if DELETE policy exists
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE tablename = 'meta_credentials'
            AND policyname = 'Users can delete own meta credentials'
        ) THEN
            CREATE POLICY "Users can delete own meta credentials"
                ON meta_credentials FOR DELETE
                USING (auth.uid() = user_id);
        END IF;
    END IF;
END $$;
