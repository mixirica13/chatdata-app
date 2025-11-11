import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createMetaGraphAPI } from '@/lib/metaGraphAPI';
import { AdAccount } from '@/types/facebook';

interface MetaConnection {
  access_token: string;
  meta_user_id: string;
  expires_at: string;
  granted_scopes: string[];
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
}

export const useMetaData = (): UseMetaDataResult => {
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<AdAccount | null>(null);
  const [insights, setInsights] = useState<CampaignInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

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

        // Fetch Meta connection with access token
        const { data: connection, error: connectionError } = await supabase
          .from('meta_connections')
          .select('access_token, meta_user_id, expires_at, granted_scopes')
          .eq('user_id', user.id)
          .single();

        if (connectionError || !connection) {
          setError('Conexão Meta não encontrada');
          setIsLoading(false);
          return;
        }

        // Check if token is expired
        const expiresAt = new Date(connection.expires_at);
        if (expiresAt < new Date()) {
          setError('Token expirado. Reconecte sua conta Meta.');
          setIsLoading(false);
          return;
        }

        setAccessToken(connection.access_token);

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

        // Check if we have cached ad accounts in database
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        const { data: cachedAccounts, error: cacheError } = await supabase
          .from('meta_ad_accounts')
          .select('*')
          .eq('user_id', user.id);

        if (cachedAccounts && cachedAccounts.length > 0) {
          // Use cached accounts
          const accounts: AdAccount[] = cachedAccounts.map(acc => ({
            id: acc.ad_account_id,
            account_id: acc.account_id,
            name: acc.name,
            currency: acc.currency,
            business: acc.business_id ? {
              id: acc.business_id,
              name: acc.business_name || ''
            } : undefined
          }));

          setAdAccounts(accounts);

          if (accounts.length > 0) {
            setSelectedAccount(accounts[0]);
          }
        } else {
          // Fetch from Meta API
          const api = createMetaGraphAPI(accessToken);
          const accounts = await api.getAdAccounts();

          setAdAccounts(accounts);

          if (accounts.length > 0) {
            setSelectedAccount(accounts[0]);

            // Save to database for caching
            const accountsToInsert = accounts.map(acc => ({
              user_id: user.id,
              account_id: acc.account_id,
              ad_account_id: acc.id,
              name: acc.name,
              currency: acc.currency,
              business_id: acc.business?.id || null,
              business_name: acc.business?.name || null,
            }));

            await supabase
              .from('meta_ad_accounts')
              .upsert(accountsToInsert, {
                onConflict: 'user_id,account_id',
                ignoreDuplicates: false
              });
          }
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
        const api = createMetaGraphAPI(accessToken);

        // Get account-level insights for last 7 days
        const response = await fetch(
          `https://graph.facebook.com/v24.0/${selectedAccount.id}/insights?` +
          `fields=impressions,clicks,spend,ctr,cpc,cpm,reach,frequency,actions&` +
          `date_preset=last_7d&` +
          `access_token=${accessToken}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Erro ao buscar insights');
        }

        const data = await response.json();

        if (data.data && data.data.length > 0) {
          const insightData = data.data[0];

          // Process actions/conversions
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
          // No insights data available
          setInsights(null);
          setError('Nenhum dado de insights disponível para este período');
        }
      } catch (err: any) {
        console.error('Error fetching insights:', err);
        setError(err.message || 'Erro ao carregar métricas');
      }
    };

    fetchInsights();
  }, [accessToken, selectedAccount]);

  const refreshData = async () => {
    if (!accessToken) return;

    try {
      setIsLoading(true);
      setError(null);

      // Re-fetch ad accounts from API
      const api = createMetaGraphAPI(accessToken);
      const accounts = await api.getAdAccounts();

      setAdAccounts(accounts);

      // Update cache
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const accountsToUpdate = accounts.map(acc => ({
          user_id: user.id,
          account_id: acc.account_id,
          ad_account_id: acc.id,
          name: acc.name,
          currency: acc.currency,
          business_id: acc.business?.id || null,
          business_name: acc.business?.name || null,
        }));

        await supabase
          .from('meta_ad_accounts')
          .upsert(accountsToUpdate, {
            onConflict: 'user_id,account_id',
            ignoreDuplicates: false
          });
      }

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

  return {
    adAccounts,
    selectedAccount,
    insights,
    isLoading,
    error,
    setSelectedAccount,
    refreshData,
  };
};
