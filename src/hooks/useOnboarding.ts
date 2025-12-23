import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface OnboardingTarget {
  step: number;
  element: HTMLElement;
}

export const useOnboarding = () => {
  const {
    onboardingCompleted,
    onboardingStep,
    updateOnboardingStep,
    completeOnboarding,
    metaConnected,
    whatsappConnected,
    isSubscribed,
    refreshProfile,
  } = useAuth();

  const [targetElements, setTargetElements] = useState<Map<number, HTMLElement>>(new Map());
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Determina se deve mostrar o onboarding
  // Removido passo 2 (WhatsApp) temporariamente
  const shouldShowOnboarding = useMemo(() => {
    // Não mostrar se já completou ou se é assinante
    if (onboardingCompleted || isSubscribed) return false;
    // Mostrar apenas se estiver no passo 1 (Meta)
    return onboardingStep === 1;
  }, [onboardingCompleted, onboardingStep, isSubscribed]);

  // Registra elemento alvo para um passo específico
  const registerTarget = useCallback((step: number, element: HTMLElement | null) => {
    if (element) {
      setTargetElements(prev => new Map(prev).set(step, element));
    }
  }, []);

  // Retorna o retângulo do elemento alvo para um passo
  const getTargetRect = useCallback((step: number): DOMRect | null => {
    const element = targetElements.get(step);
    return element?.getBoundingClientRect() || null;
  }, [targetElements]);

  // Inicia o onboarding (chamado após cadastro)
  // Removido passo 2 (WhatsApp) temporariamente
  const startOnboarding = useCallback(async () => {
    // Se já conectou Meta, completa o onboarding
    if (metaConnected) {
      await completeOnboarding();
    } else {
      // Começa do passo 1
      await updateOnboardingStep(1);
    }
  }, [metaConnected, updateOnboardingStep, completeOnboarding]);

  // Avança para o próximo passo
  // Removido passo 2 (WhatsApp) temporariamente - completa após Meta
  const nextStep = useCallback(async () => {
    setIsTransitioning(true);
    try {
      if (onboardingStep === 1) {
        await completeOnboarding();
      }
      /* Passo 2 WhatsApp comentado temporariamente
      else if (onboardingStep === 2) {
        await completeOnboarding();
      }
      */
    } finally {
      setTimeout(() => setIsTransitioning(false), 300);
    }
  }, [onboardingStep, completeOnboarding]);

  // Pula o passo atual
  // Removido passo 2 (WhatsApp) temporariamente
  const skipStep = useCallback(async () => {
    setIsTransitioning(true);
    try {
      // Apenas fecha temporariamente, não avança
      /* Passo 2 WhatsApp comentado temporariamente
      if (onboardingStep === 1) {
        await updateOnboardingStep(2);
      } else if (onboardingStep === 2) {
        await completeOnboarding();
      }
      */
    } finally {
      setTimeout(() => setIsTransitioning(false), 300);
    }
  }, []);

  // Auto-avança quando conexão é feita
  // Removido passo 2 (WhatsApp) temporariamente
  useEffect(() => {
    const handleAutoAdvance = async () => {
      if (isTransitioning) return;

      // Se está no passo 1 e Meta foi conectado, completa
      if (onboardingStep === 1 && metaConnected) {
        setIsTransitioning(true);
        // Aguarda um pouco para o usuário ver que conectou
        setTimeout(async () => {
          await completeOnboarding();
          setIsTransitioning(false);
        }, 500);
      }
      /* Passo 2 WhatsApp comentado temporariamente
      else if (onboardingStep === 2 && whatsappConnected) {
        setIsTransitioning(true);
        setTimeout(async () => {
          await completeOnboarding();
          setIsTransitioning(false);
        }, 500);
      }
      */
    };

    handleAutoAdvance();
  }, [metaConnected, onboardingStep, isTransitioning, completeOnboarding]);

  // Conteúdo dos tooltips para cada passo
  // Passo 2 (WhatsApp) comentado temporariamente
  const tooltipContent = useMemo(() => ({
    1: {
      title: 'Conecte sua conta do Meta Ads',
      description: 'O agente de IA ChatData precisa acessar suas contas de anúncio do Facebook para analisar suas campanhas e fornecer insights personalizados em tempo real. Seus dados são protegidos e nunca compartilhados com terceiros.',
    },
    /* Passo 2 WhatsApp comentado temporariamente
    2: {
      title: 'Autentique seu WhatsApp',
      description: 'Vincule seu número de WhatsApp para receber insights diretamente no seu celular. A IA ChatData vai te enviar análises, alertas e recomendações de otimização das suas campanhas.',
    },
    */
  }), []);

  return {
    shouldShowOnboarding,
    currentStep: onboardingStep,
    isTransitioning,
    registerTarget,
    getTargetRect,
    startOnboarding,
    nextStep,
    skipStep,
    completeOnboarding,
    tooltipContent,
    refreshProfile,
  };
};
