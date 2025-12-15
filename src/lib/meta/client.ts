import {
  MetaInsightsParams,
  MetaInsightsResponse,
  MetaAdAccount,
  MetaCampaign,
  MetaAdSet,
  MetaAd,
  MetaUser,
} from '@/types/meta';
import { META_BASE_URL, INSIGHTS_FIELDS, CAMPAIGN_FIELDS, ADSET_FIELDS, AD_FIELDS, ACCOUNT_FIELDS } from './constants';

interface MetaApiError {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id?: string;
  };
}

export class MetaApiClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async request<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${META_BASE_URL}${endpoint}`);
    url.searchParams.set('access_token', this.accessToken);

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    const response = await fetch(url.toString());
    const data = await response.json();

    if (!response.ok || data.error) {
      const error = data as MetaApiError;
      throw new Error(error.error?.message || 'Meta API Error');
    }

    return data as T;
  }

  async validateToken(): Promise<MetaUser> {
    return this.request('/me', { fields: 'id,name' });
  }

  async getAdAccounts(): Promise<MetaAdAccount[]> {
    const response = await this.request<{ data: MetaAdAccount[] }>('/me/adaccounts', {
      fields: ACCOUNT_FIELDS.join(','),
      limit: '100',
    });
    return response.data;
  }

  async getAccountInfo(accountId: string): Promise<MetaAdAccount> {
    return this.request(`/${accountId}`, {
      fields: ACCOUNT_FIELDS.join(','),
    });
  }

  async getInsights(params: MetaInsightsParams): Promise<MetaInsightsResponse[]> {
    const { accountId, datePreset, timeRange, level = 'account', fields, breakdown } = params;

    const queryParams: Record<string, string> = {
      fields: fields?.join(',') || INSIGHTS_FIELDS.join(','),
      level,
    };

    if (datePreset) {
      queryParams.date_preset = datePreset;
    } else if (timeRange) {
      queryParams.time_range = JSON.stringify(timeRange);
    }

    if (breakdown) {
      queryParams.breakdowns = breakdown;
    }

    const response = await this.request<{ data: MetaInsightsResponse[] }>(
      `/${accountId}/insights`,
      queryParams
    );

    return response.data || [];
  }

  async getInsightsWithTimeIncrement(
    accountId: string,
    timeRange: { since: string; until: string },
    timeIncrement: number = 1
  ): Promise<MetaInsightsResponse[]> {
    const queryParams: Record<string, string> = {
      fields: INSIGHTS_FIELDS.join(','),
      level: 'account',
      time_range: JSON.stringify(timeRange),
      time_increment: timeIncrement.toString(),
    };

    const response = await this.request<{ data: MetaInsightsResponse[] }>(
      `/${accountId}/insights`,
      queryParams
    );

    return response.data || [];
  }

  async getCampaigns(accountId: string, limit = 50): Promise<MetaCampaign[]> {
    const response = await this.request<{ data: MetaCampaign[] }>(`/${accountId}/campaigns`, {
      fields: CAMPAIGN_FIELDS.join(','),
      limit: limit.toString(),
      filtering: JSON.stringify([
        { field: 'effective_status', operator: 'IN', value: ['ACTIVE', 'PAUSED'] },
      ]),
    });
    return response.data;
  }

  async getCampaignInsights(
    accountId: string,
    timeRange: { since: string; until: string }
  ): Promise<MetaInsightsResponse[]> {
    const response = await this.request<{ data: MetaInsightsResponse[] }>(`/${accountId}/insights`, {
      fields: 'campaign_id,campaign_name,spend,impressions,clicks,ctr,cpc,cpm,reach,actions,action_values',
      level: 'campaign',
      time_range: JSON.stringify(timeRange),
      limit: '100',
    });
    return response.data || [];
  }

  async getAdSets(accountId: string, limit = 50): Promise<MetaAdSet[]> {
    const response = await this.request<{ data: MetaAdSet[] }>(`/${accountId}/adsets`, {
      fields: ADSET_FIELDS.join(','),
      limit: limit.toString(),
    });
    return response.data;
  }

  async getAdSetInsights(
    accountId: string,
    timeRange: { since: string; until: string }
  ): Promise<MetaInsightsResponse[]> {
    const response = await this.request<{ data: MetaInsightsResponse[] }>(`/${accountId}/insights`, {
      fields: 'adset_id,adset_name,spend,impressions,clicks,ctr,cpc,cpm,reach,actions,action_values',
      level: 'adset',
      time_range: JSON.stringify(timeRange),
      limit: '100',
    });
    return response.data || [];
  }

  async getAds(accountId: string, limit = 50): Promise<MetaAd[]> {
    const response = await this.request<{ data: MetaAd[] }>(`/${accountId}/ads`, {
      fields: AD_FIELDS.join(','),
      limit: limit.toString(),
    });
    return response.data;
  }

  async getAdInsights(
    accountId: string,
    timeRange: { since: string; until: string }
  ): Promise<MetaInsightsResponse[]> {
    const response = await this.request<{ data: MetaInsightsResponse[] }>(`/${accountId}/insights`, {
      fields: 'ad_id,ad_name,spend,impressions,clicks,ctr,cpc,cpm,reach,actions,action_values',
      level: 'ad',
      time_range: JSON.stringify(timeRange),
      limit: '100',
    });
    return response.data || [];
  }

  async getAccountBalance(accountId: string): Promise<{
    balance: number;
    currency: string;
    displayString: string | null;
  }> {
    interface FundingSourceResponse {
      funding_source_details?: {
        id: string;
        display_string: string;
        type: number;
      };
      currency: string;
      id: string;
    }

    const response = await this.request<FundingSourceResponse>(`/${accountId}`, {
      fields: 'funding_source_details,currency',
    });

    const displayString = response.funding_source_details?.display_string || null;

    // Extrai o valor numérico do display_string
    let balance = 0;
    if (displayString) {
      const match = displayString.match(/[\d.,]+/g);
      if (match) {
        const numbers = match.map(n => {
          const normalized = n.replace(/\./g, '').replace(',', '.');
          return parseFloat(normalized) || 0;
        });
        balance = Math.max(...numbers);
      }
    }

    return {
      balance,
      currency: response.currency,
      displayString,
    };
  }

  async getMultipleAccountBalances(accountIds: string[]): Promise<Array<{
    accountId: string;
    balance: number;
    currency: string;
    displayString: string | null;
    error: string | null;
  }>> {
    const results = await Promise.all(
      accountIds.map(async (accountId) => {
        try {
          const data = await this.getAccountBalance(accountId);
          return {
            accountId,
            balance: data.balance,
            currency: data.currency,
            displayString: data.displayString,
            error: null,
          };
        } catch (error) {
          return {
            accountId,
            balance: 0,
            currency: 'BRL',
            displayString: null,
            error: error instanceof Error ? error.message : 'Erro desconhecido',
          };
        }
      })
    );
    return results;
  }

  async getScheduledBudget(accountId: string): Promise<{
    totalDailyBudget: number;
    cboBudget: number;
    aboBudget: number;
    currency: string;
    details: {
      cboCampaigns: Array<{ id: string; name: string; daily_budget: number }>;
      aboAdSets: Array<{ id: string; name: string; daily_budget: number; campaign_id?: string }>;
    };
  }> {
    // Busca campanhas ativas com orçamento (CBO)
    const campaignsResponse = await this.request<{ data: MetaCampaign[] }>(`/${accountId}/campaigns`, {
      fields: 'id,name,daily_budget,lifetime_budget,status,effective_status',
      limit: '500',
      filtering: JSON.stringify([
        { field: 'effective_status', operator: 'IN', value: ['ACTIVE'] },
      ]),
    });

    // Busca conjuntos de anúncios ativos com orçamento (ABO)
    const adSetsResponse = await this.request<{ data: Array<MetaAdSet & { campaign_id?: string }> }>(`/${accountId}/adsets`, {
      fields: 'id,name,daily_budget,lifetime_budget,status,effective_status,campaign_id',
      limit: '500',
      filtering: JSON.stringify([
        { field: 'effective_status', operator: 'IN', value: ['ACTIVE'] },
      ]),
    });

    // Busca moeda da conta
    const accountInfo = await this.request<{ currency: string }>(`/${accountId}`, {
      fields: 'currency',
    });

    const campaigns = campaignsResponse.data || [];
    const adSets = adSetsResponse.data || [];

    // Campanhas CBO: têm daily_budget ou lifetime_budget definido
    const cboCampaigns = campaigns
      .filter(c => c.daily_budget || c.lifetime_budget)
      .map(c => ({
        id: c.id,
        name: c.name,
        daily_budget: c.daily_budget ? parseFloat(c.daily_budget) / 100 : 0,
      }));

    // IDs das campanhas CBO (para excluir ad sets dessas campanhas)
    const cboCampaignIds = new Set(cboCampaigns.map(c => c.id));

    // Ad Sets ABO: têm daily_budget ou lifetime_budget E não pertencem a campanhas CBO
    const aboAdSets = adSets
      .filter(as => {
        const hasBudget = as.daily_budget || as.lifetime_budget;
        const isNotCBO = !as.campaign_id || !cboCampaignIds.has(as.campaign_id);
        return hasBudget && isNotCBO;
      })
      .map(as => ({
        id: as.id,
        name: as.name,
        daily_budget: as.daily_budget ? parseFloat(as.daily_budget) / 100 : 0,
        campaign_id: as.campaign_id,
      }));

    const cboBudget = cboCampaigns.reduce((sum, c) => sum + c.daily_budget, 0);
    const aboBudget = aboAdSets.reduce((sum, as) => sum + as.daily_budget, 0);

    return {
      totalDailyBudget: cboBudget + aboBudget,
      cboBudget,
      aboBudget,
      currency: accountInfo.currency,
      details: {
        cboCampaigns,
        aboAdSets,
      },
    };
  }

  async getMultipleScheduledBudgets(accountIds: string[]): Promise<Array<{
    accountId: string;
    totalDailyBudget: number;
    cboBudget: number;
    aboBudget: number;
    currency: string;
    error: string | null;
  }>> {
    const results = await Promise.all(
      accountIds.map(async (accountId) => {
        try {
          const data = await this.getScheduledBudget(accountId);
          return {
            accountId,
            totalDailyBudget: data.totalDailyBudget,
            cboBudget: data.cboBudget,
            aboBudget: data.aboBudget,
            currency: data.currency,
            error: null,
          };
        } catch (error) {
          return {
            accountId,
            totalDailyBudget: 0,
            cboBudget: 0,
            aboBudget: 0,
            currency: 'BRL',
            error: error instanceof Error ? error.message : 'Erro desconhecido',
          };
        }
      })
    );
    return results;
  }

  async getMultiAccountInsights(
    accountIds: string[],
    timeRange: { since: string; until: string }
  ): Promise<Array<{
    accountId: string;
    insights: MetaInsightsResponse | null;
    error: string | null;
  }>> {
    const results = await Promise.all(
      accountIds.map(async (accountId) => {
        try {
          const insights = await this.getInsights({
            accountId,
            timeRange,
          });
          return { accountId, insights: insights[0] || null, error: null };
        } catch (error) {
          return {
            accountId,
            insights: null,
            error: error instanceof Error ? error.message : 'Erro desconhecido',
          };
        }
      })
    );
    return results;
  }
}
