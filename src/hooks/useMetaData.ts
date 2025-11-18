import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createMetaGraphAPI } from '@/lib/metaGraphAPI';
import { AdAccount } from '@/types/facebook';

interface MetaCredential {
  access_token: string;
  token_type: string;
  expires_at: string;
  granted_permissions: string[];
  ad_account_ids: string[];
}

interface CampaignInsights {
  campaign_id: string;
  campaign_name: string;
  impressions: number;
  clicks: number;
  spend: number;
  ctr: number;
  cpc: number;
  reach: number;
  frequency?: number;
  conversions?: any;
  date_start?: string;
  date_stop?: string;
}

interface UseMetaDataResult {
  adAccounts: AdAccount[];
  selectedAccount: AdAccount | null;
  insights: CampaignInsights | null;
  isLoading: boolean;
  error: string | null;
  setSelectedAccount: (account: AdAccount) => void;
  refreshData: () => Promise<void>;
  fetchInsightsWithDateRange: (startDate: string, endDate: string) => Promise<void>;
}

export const useMetaData = (): UseMetaDataResult => {
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<AdAccount | null>(null);
  const [insights, setInsights] = useState<CampaignInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);

  // Fetch Meta connection and access token
  useEffect(() => {
    const fetchMetaConnection = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setError('Usuário não autenticado');
          setIsLoading(false);
          return;
        }

        // Fetch Meta credentials with access token
        const { data: credential, error: credentialError } = await supabase
          .from('meta_credentials')
          .select('access_token, token_type, expires_at, granted_permissions, ad_account_ids')
          .eq('user_id', user.id)
          .single();

        if (credentialError || !credential) {
          setError('Conexão Meta não encontrada');
          setIsLoading(false);
          return;
        }

        // Check if token is expired
        if (credential.expires_at) {
          const expiresAt = new Date(credential.expires_at);
          if (expiresAt < new Date()) {
            setError('Token expirado. Reconecte sua conta Meta.');
            setIsLoading(false);
            return;
          }
        }

        setAccessToken(credential.access_token);

      } catch (err) {
        console.error('Error fetching Meta connection:', err);
        setError('Erro ao buscar conexão Meta');
        setIsLoading(false);
      }
    };

    fetchMetaConnection();
  }, []);

  // Fetch ad accounts when access token is available
  useEffect(() => {
    if (!accessToken) return;

    const fetchAdAccounts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch from Meta API (no caching for now)
        const api = createMetaGraphAPI(accessToken);
        const accounts = await api.getAdAccounts();

        setAdAccounts(accounts);

        if (accounts.length > 0) {
          setSelectedAccount(accounts[0]);
        }

        setIsLoading(false);
      } catch (err: any) {
        console.error('Error fetching ad accounts:', err);
        setError(err.message || 'Erro ao carregar contas de anúncios');
        setIsLoading(false);
      }
    };

    fetchAdAccounts();
  }, [accessToken]);

  // Fetch insights when selected account changes
  useEffect(() => {
    if (!accessToken || !selectedAccount) return;

    const fetchInsights = async () => {
      try {
        setError(null);
        const api = createMetaGraphAPI(accessToken);

        let url = `https://graph.facebook.com/v22.0/${selectedAccount.id}/insights?` +
          `fields=impressions,clicks,spend,ctr,cpc,cpm,reach,frequency,actions&` +
          `access_token=${accessToken}`;

        // Use custom date range if available, otherwise try preset periods
        if (dateRange) {
          url += `&time_range=${encodeURIComponent(JSON.stringify({ since: dateRange.start, until: dateRange.end }))}`;

          const response = await fetch(url);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Erro ao buscar insights');
          }

          const data = await response.json();

          if (data.data && data.data.length > 0) {
            const insightData = data.data[0];
            const actions = insightData.actions || [];
            const conversions = actions.reduce((acc: any, action: any) => {
              acc[action.action_type] = parseInt(action.value);
              return acc;
            }, {});

            const processedInsights: CampaignInsights = {
              campaign_id: selectedAccount.id,
              campaign_name: selectedAccount.name,
              impressions: parseInt(insightData.impressions || '0'),
              clicks: parseInt(insightData.clicks || '0'),
              spend: parseFloat(insightData.spend || '0'),
              ctr: parseFloat(insightData.ctr || '0'),
              cpc: parseFloat(insightData.cpc || '0'),
              reach: parseInt(insightData.reach || '0'),
              frequency: parseFloat(insightData.frequency || '0'),
              conversions,
              date_start: insightData.date_start,
              date_stop: insightData.date_stop,
            };

            setInsights(processedInsights);
          } else {
            setInsights(null);
            setError('Nenhum dado disponível para o período selecionado');
          }
        } else {
          // Try different time periods until we find data
          const periods = ['last_7d', 'last_14d', 'last_30d', 'last_90d'];
          let foundData = false;

          for (const period of periods) {
            const response = await fetch(url + `&date_preset=${period}`);

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error?.message || 'Erro ao buscar insights');
            }

            const data = await response.json();

            if (data.data && data.data.length > 0) {
              const insightData = data.data[0];
              const actions = insightData.actions || [];
              const conversions = actions.reduce((acc: any, action: any) => {
                acc[action.action_type] = parseInt(action.value);
                return acc;
              }, {});

              const processedInsights: CampaignInsights = {
                campaign_id: selectedAccount.id,
                campaign_name: selectedAccount.name,
                impressions: parseInt(insightData.impressions || '0'),
                clicks: parseInt(insightData.clicks || '0'),
                spend: parseFloat(insightData.spend || '0'),
                ctr: parseFloat(insightData.ctr || '0'),
                cpc: parseFloat(insightData.cpc || '0'),
                reach: parseInt(insightData.reach || '0'),
                frequency: parseFloat(insightData.frequency || '0'),
                conversions,
                date_start: insightData.date_start,
                date_stop: insightData.date_stop,
              };

              setInsights(processedInsights);
              foundData = true;
              break;
            }
          }

          if (!foundData) {
            setInsights(null);
            setError('Esta conta não possui dados de anúncios nos últimos 90 dias');
          }
        }
      } catch (err: any) {
        console.error('Error fetching insights:', err);
        setError(err.message || 'Erro ao carregar métricas');
      }
    };

    fetchInsights();
  }, [accessToken, selectedAccount, dateRange]);

  const refreshData = async () => {
    if (!accessToken) return;

    try {
      setIsLoading(true);
      setError(null);

      // Re-fetch ad accounts from API
      const api = createMetaGraphAPI(accessToken);
      const accounts = await api.getAdAccounts();

      setAdAccounts(accounts);

      // Re-fetch insights if account is selected
      if (selectedAccount) {
        const updatedAccount = accounts.find(acc => acc.id === selectedAccount.id);
        if (updatedAccount) {
          setSelectedAccount(updatedAccount);
        }
      }

      setIsLoading(false);
    } catch (err: any) {
      console.error('Error refreshing data:', err);
      setError(err.message || 'Erro ao atualizar dados');
      setIsLoading(false);
    }
  };

  const fetchInsightsWithDateRange = async (startDate: string, endDate: string) => {
    setDateRange({ start: startDate, end: endDate });
  };

  return {
    adAccounts,
    selectedAccount,
    insights,
    isLoading,
    error,
    setSelectedAccount,
    refreshData,
    fetchInsightsWithDateRange,
  };
};
