// Meta API Types
export interface MetaAdAccount {
  id: string;
  name: string;
  currency: string;
  account_status: number;
  balance?: string;
  amount_spent?: string;
  spend_cap?: string;
  business_name?: string;
}

export type DatePreset =
  | 'today'
  | 'yesterday'
  | 'this_month'
  | 'last_month'
  | 'last_7d'
  | 'last_14d'
  | 'last_30d'
  | 'last_90d'
  | 'maximum';

export interface MetaInsightsParams {
  accountId: string;
  datePreset?: DatePreset;
  timeRange?: {
    since: string;
    until: string;
  };
  level?: 'account' | 'campaign' | 'adset' | 'ad';
  fields?: string[];
  breakdown?: string;
}

export interface MetaInsightsResponse {
  spend: string;
  impressions: string;
  clicks: string;
  reach: string;
  cpc: string;
  cpm: string;
  ctr: string;
  actions?: MetaAction[];
  action_values?: MetaAction[];
  date_start: string;
  date_stop: string;
  campaign_id?: string;
  campaign_name?: string;
  adset_id?: string;
  adset_name?: string;
  ad_id?: string;
  ad_name?: string;
}

export interface MetaAction {
  action_type: string;
  value: string;
}

export interface MetaCampaign {
  id: string;
  name: string;
  status: string;
  effective_status?: string;
  objective?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  created_time?: string;
  insights?: MetaInsightsResponse;
}

export interface MetaAdSet {
  id: string;
  name: string;
  status: string;
  effective_status?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  optimization_goal?: string;
  campaign_id?: string;
  insights?: MetaInsightsResponse;
}

export interface MetaAd {
  id: string;
  name: string;
  status: string;
  effective_status?: string;
  creative?: { id: string };
  created_time?: string;
  insights?: MetaInsightsResponse;
}

export interface MetaUser {
  id: string;
  name: string;
}

export interface MetaAccountBalance {
  balance: number;
  currency: string;
  displayString: string | null;
}

export interface MetaScheduledBudget {
  totalDailyBudget: number;
  cboBudget: number;
  aboBudget: number;
  currency: string;
  details: {
    cboCampaigns: Array<{ id: string; name: string; daily_budget: number }>;
    aboAdSets: Array<{ id: string; name: string; daily_budget: number; campaign_id?: string }>;
  };
}

// API Response types
export interface MultiAccountInsightsResult {
  accountId: string;
  insights: MetaInsightsResponse | null;
  error: string | null;
}

export interface MultiAccountBalanceResult {
  accountId: string;
  balance: number;
  currency: string;
  displayString: string | null;
  error: string | null;
}

export interface MultiAccountBudgetResult {
  accountId: string;
  totalDailyBudget: number;
  cboBudget: number;
  aboBudget: number;
  currency: string;
  error: string | null;
}
