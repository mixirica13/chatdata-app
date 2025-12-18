import { useMemo, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

const PRE_TRIAL_LIMIT = 5;

export const usePreTrial = () => {
  const {
    isSubscribed,
    preTrialRequestsCount,
    refreshProfile,
  } = useAuth();

  const [showPaywall, setShowPaywall] = useState(false);

  // Verifica se pode fazer requisições
  const canMakeRequest = useMemo(() => {
    if (isSubscribed) return true;
    return preTrialRequestsCount < PRE_TRIAL_LIMIT;
  }, [isSubscribed, preTrialRequestsCount]);

  // Requisições restantes
  const requestsRemaining = useMemo(() => {
    if (isSubscribed) return Infinity;
    return Math.max(0, PRE_TRIAL_LIMIT - preTrialRequestsCount);
  }, [isSubscribed, preTrialRequestsCount]);

  // Verifica se atingiu o limite
  const hasReachedLimit = useMemo(() => {
    if (isSubscribed) return false;
    return preTrialRequestsCount >= PRE_TRIAL_LIMIT;
  }, [isSubscribed, preTrialRequestsCount]);

  // Verifica e mostra paywall se necessário
  const checkAndShowPaywall = useCallback(async () => {
    // Atualiza o profile para pegar o contador mais recente
    await refreshProfile();

    if (!isSubscribed && preTrialRequestsCount >= PRE_TRIAL_LIMIT) {
      setShowPaywall(true);
      return true;
    }
    return false;
  }, [isSubscribed, preTrialRequestsCount, refreshProfile]);

  // Esconde o paywall
  const hidePaywall = useCallback(() => {
    setShowPaywall(false);
  }, []);

  return {
    canMakeRequest,
    requestsRemaining,
    requestsUsed: preTrialRequestsCount,
    requestsLimit: PRE_TRIAL_LIMIT,
    hasReachedLimit,
    showPaywall,
    setShowPaywall,
    checkAndShowPaywall,
    hidePaywall,
    isSubscribed,
  };
};
