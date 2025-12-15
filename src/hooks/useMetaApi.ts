import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MetaApiClient } from '@/lib/meta/client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import type { MetaInsightsResponse, MetaAdAccount, MetaCampaign, MetaAdSet, MetaAd } from '@/types/meta';
import type { Dashboard, Widget, DashboardAdAccount } from '@/types/dashboard';

// Hook para obter o access token do usuário
export function useMetaAccessToken() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('Usuário não autenticado');
          setIsLoading(false);
          return;
        }

        const { data: credential, error: credentialError } = await supabase
          .from('meta_credentials')
          .select('access_token, expires_at')
          .eq('user_id', user.id)
          .single();

        if (credentialError || !credential) {
          setError('Token Meta não encontrado');
          setIsLoading(false);
          return;
        }

        // Verificar expiração
        if (credential.expires_at) {
          const expiresAt = new Date(credential.expires_at);
          if (expiresAt < new Date()) {
            setError('Token expirado. Reconecte sua conta Meta.');
            setIsLoading(false);
            return;
          }
        }

        setAccessToken(credential.access_token);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching token:', err);
        setError('Erro ao buscar token');
        setIsLoading(false);
      }
    };

    fetchToken();
  }, []);

  return { accessToken, isLoading, error };
}

// Hook principal para operações com Meta API
export function useMetaApi() {
  const { accessToken, isLoading: isLoadingToken, error: tokenError } = useMetaAccessToken();

  const client = useMemo(() => {
    if (!accessToken) return null;
    return new MetaApiClient(accessToken);
  }, [accessToken]);

  return {
    client,
    isReady: !!client,
    isLoadingToken,
    tokenError,
  };
}

// Hook para buscar contas de anúncios
export function useAdAccounts() {
  const { client, isReady } = useMetaApi();

  return useQuery({
    queryKey: ['meta', 'adAccounts'],
    queryFn: () => client!.getAdAccounts(),
    enabled: isReady,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para buscar insights de múltiplas contas
export function useMultiAccountInsights(
  accountIds: string[],
  timeRange: { since: string; until: string },
  enabled = true
) {
  const { client, isReady } = useMetaApi();

  return useQuery({
    queryKey: ['meta', 'multiAccountInsights', accountIds, timeRange],
    queryFn: () => client!.getMultiAccountInsights(accountIds, timeRange),
    enabled: isReady && enabled && accountIds.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

// Hook para buscar saldo de múltiplas contas
export function useMultiAccountBalances(accountIds: string[], enabled = true) {
  const { client, isReady } = useMetaApi();

  return useQuery({
    queryKey: ['meta', 'multiAccountBalances', accountIds],
    queryFn: () => client!.getMultipleAccountBalances(accountIds),
    enabled: isReady && enabled && accountIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para buscar orçamento programado de múltiplas contas
export function useMultiAccountBudgets(accountIds: string[], enabled = true) {
  const { client, isReady } = useMetaApi();

  return useQuery({
    queryKey: ['meta', 'multiAccountBudgets', accountIds],
    queryFn: () => client!.getMultipleScheduledBudgets(accountIds),
    enabled: isReady && enabled && accountIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para buscar insights com incremento de tempo (para gráficos)
export function useInsightsWithTimeIncrement(
  accountId: string,
  timeRange: { since: string; until: string },
  timeIncrement = 1,
  enabled = true
) {
  const { client, isReady } = useMetaApi();

  return useQuery({
    queryKey: ['meta', 'insightsTimeIncrement', accountId, timeRange, timeIncrement],
    queryFn: () => client!.getInsightsWithTimeIncrement(accountId, timeRange, timeIncrement),
    enabled: isReady && enabled && !!accountId,
    staleTime: 2 * 60 * 1000,
  });
}

// Hook para buscar insights de campanhas
export function useCampaignInsights(
  accountId: string,
  timeRange: { since: string; until: string },
  enabled = true
) {
  const { client, isReady } = useMetaApi();

  return useQuery({
    queryKey: ['meta', 'campaignInsights', accountId, timeRange],
    queryFn: () => client!.getCampaignInsights(accountId, timeRange),
    enabled: isReady && enabled && !!accountId,
    staleTime: 2 * 60 * 1000,
  });
}

// Hook para buscar insights de ad sets
export function useAdSetInsights(
  accountId: string,
  timeRange: { since: string; until: string },
  enabled = true
) {
  const { client, isReady } = useMetaApi();

  return useQuery({
    queryKey: ['meta', 'adSetInsights', accountId, timeRange],
    queryFn: () => client!.getAdSetInsights(accountId, timeRange),
    enabled: isReady && enabled && !!accountId,
    staleTime: 2 * 60 * 1000,
  });
}

// Hook para buscar insights de anúncios
export function useAdInsights(
  accountId: string,
  timeRange: { since: string; until: string },
  enabled = true
) {
  const { client, isReady } = useMetaApi();

  return useQuery({
    queryKey: ['meta', 'adInsights', accountId, timeRange],
    queryFn: () => client!.getAdInsights(accountId, timeRange),
    enabled: isReady && enabled && !!accountId,
    staleTime: 2 * 60 * 1000,
  });
}

// ============================================
// Hooks para Dashboard (Supabase)
// ============================================

// Hook para buscar dashboard padrão do usuário
export function useDefaultDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'default'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Busca dashboard padrão
      let { data: dashboard, error } = await supabase
        .from('dashboards')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .single();

      // Se não existir, cria um novo
      if (error || !dashboard) {
        const { data: newDashboard, error: createError } = await supabase
          .from('dashboards')
          .insert({
            user_id: user.id,
            name: 'Dashboard Principal',
            is_default: true,
          })
          .select()
          .single();

        if (createError) throw createError;
        dashboard = newDashboard;
      }

      // Busca widgets do dashboard
      const { data: widgets, error: widgetsError } = await supabase
        .from('widgets')
        .select('*')
        .eq('dashboard_id', dashboard.id)
        .order('created_at', { ascending: true });

      if (widgetsError) throw widgetsError;

      return {
        ...dashboard,
        widgets: widgets || [],
      } as Dashboard;
    },
  });
}

// Hook para buscar ad accounts ativas do usuário
export function useActiveAdAccounts() {
  return useQuery({
    queryKey: ['dashboard', 'adAccounts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('dashboard_ad_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      return data as DashboardAdAccount[];
    },
  });
}

// Hook para criar widget
export function useCreateWidget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (widget: {
      dashboardId: string;
      type: string;
      title: string;
      position: { x: number; y: number; w: number; h: number };
      config: Record<string, unknown>;
    }) => {
      const { data, error } = await supabase
        .from('widgets')
        .insert({
          dashboard_id: widget.dashboardId,
          type: widget.type,
          title: widget.title,
          position: widget.position,
          config: widget.config,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Widget;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Hook para atualizar posições dos widgets
export function useUpdateWidgetPositions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (widgets: { id: string; position: { x: number; y: number; w: number; h: number } }[]) => {
      const promises = widgets.map(widget =>
        supabase
          .from('widgets')
          .update({ position: widget.position })
          .eq('id', widget.id)
      );

      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Hook para deletar widget
export function useDeleteWidget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (widgetId: string) => {
      const { error } = await supabase
        .from('widgets')
        .delete()
        .eq('id', widgetId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Hook para atualizar config do widget
export function useUpdateWidgetConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ widgetId, config }: { widgetId: string; config: Record<string, unknown> }) => {
      const { data, error } = await supabase
        .from('widgets')
        .update({ config })
        .eq('id', widgetId)
        .select()
        .single();

      if (error) throw error;
      return data as Widget;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Hook para salvar ad accounts selecionadas
export function useSaveAdAccounts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accounts: { account_id: string; account_name: string; currency: string }[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Remove todas as contas existentes
      await supabase
        .from('dashboard_ad_accounts')
        .delete()
        .eq('user_id', user.id);

      // Insere as novas contas
      if (accounts.length > 0) {
        const { error } = await supabase
          .from('dashboard_ad_accounts')
          .insert(
            accounts.map(acc => ({
              user_id: user.id,
              account_id: acc.account_id,
              account_name: acc.account_name,
              currency: acc.currency,
              is_active: true,
            }))
          );

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'adAccounts'] });
    },
  });
}
