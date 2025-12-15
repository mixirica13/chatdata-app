-- Create dashboards table
CREATE TABLE IF NOT EXISTS dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Meu Dashboard',
  is_default BOOLEAN NOT NULL DEFAULT false,
  layout JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create widgets table
CREATE TABLE IF NOT EXISTS widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  position JSONB NOT NULL DEFAULT '{"x": 0, "y": 0, "w": 4, "h": 3}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create dashboard_ad_accounts table for linking dashboards to ad accounts
CREATE TABLE IF NOT EXISTS dashboard_ad_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL,
  account_name TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(dashboard_id, account_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dashboards_user_id ON dashboards(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboards_is_default ON dashboards(is_default);
CREATE INDEX IF NOT EXISTS idx_widgets_dashboard_id ON widgets(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_ad_accounts_dashboard_id ON dashboard_ad_accounts(dashboard_id);

-- Enable RLS
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_ad_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dashboards
CREATE POLICY "Users can view their own dashboards"
  ON dashboards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dashboards"
  ON dashboards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboards"
  ON dashboards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dashboards"
  ON dashboards FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for widgets
CREATE POLICY "Users can view widgets from their dashboards"
  ON widgets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dashboards
      WHERE dashboards.id = widgets.dashboard_id
      AND dashboards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create widgets in their dashboards"
  ON widgets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dashboards
      WHERE dashboards.id = widgets.dashboard_id
      AND dashboards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update widgets in their dashboards"
  ON widgets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM dashboards
      WHERE dashboards.id = widgets.dashboard_id
      AND dashboards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete widgets from their dashboards"
  ON widgets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM dashboards
      WHERE dashboards.id = widgets.dashboard_id
      AND dashboards.user_id = auth.uid()
    )
  );

-- RLS Policies for dashboard_ad_accounts
CREATE POLICY "Users can view ad accounts from their dashboards"
  ON dashboard_ad_accounts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dashboards
      WHERE dashboards.id = dashboard_ad_accounts.dashboard_id
      AND dashboards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add ad accounts to their dashboards"
  ON dashboard_ad_accounts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dashboards
      WHERE dashboards.id = dashboard_ad_accounts.dashboard_id
      AND dashboards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update ad accounts in their dashboards"
  ON dashboard_ad_accounts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM dashboards
      WHERE dashboards.id = dashboard_ad_accounts.dashboard_id
      AND dashboards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove ad accounts from their dashboards"
  ON dashboard_ad_accounts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM dashboards
      WHERE dashboards.id = dashboard_ad_accounts.dashboard_id
      AND dashboards.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_dashboards_updated_at ON dashboards;
CREATE TRIGGER update_dashboards_updated_at
  BEFORE UPDATE ON dashboards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_widgets_updated_at ON widgets;
CREATE TRIGGER update_widgets_updated_at
  BEFORE UPDATE ON widgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
