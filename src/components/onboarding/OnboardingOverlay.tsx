import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { OnboardingTooltip } from './OnboardingTooltip';
import { useNavigate, useLocation } from 'react-router-dom';

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
}

// Configuração de onboarding por página e passo
const ONBOARDING_CONFIG = {
  // Passo 1: Conectar Meta
  1: {
    '/dashboard': {
      selector: '[data-onboarding-target="meta"]',
      title: 'Conecte sua conta do Meta Ads',
      description: 'O agente de IA ChatData precisa acessar suas contas de anúncio do Facebook para analisar suas campanhas e fornecer insights personalizados em tempo real. Seus dados são protegidos e nunca compartilhados com terceiros.',
      nextLabel: 'Conectar',
      action: 'navigate', // navega para /connect/meta
      position: 'bottom' as const,
    },
    '/connect/meta': {
      selector: '[data-onboarding-target="meta-button"]',
      title: 'Clique para autorizar',
      description: 'Clique no botão abaixo para abrir a janela de autorização do Facebook. Você precisará fazer login na sua conta do Facebook e autorizar o acesso às suas contas de anúncio.',
      nextLabel: 'Entendi',
      action: 'dismiss', // fecha o tooltip para o usuário clicar no botão real
      position: 'top' as const,
    },
  },
  /* Passo 2: Conectar WhatsApp - COMENTADO TEMPORARIAMENTE
  2: {
    '/dashboard': {
      selector: '[data-onboarding-target="whatsapp"]',
      title: 'Autentique seu WhatsApp',
      description: 'Vincule seu número de WhatsApp para receber insights diretamente no seu celular. A IA ChatData vai te enviar análises, alertas e recomendações de otimização das suas campanhas.',
      nextLabel: 'Conectar',
      action: 'navigate', // navega para /connect/whatsapp
      position: 'bottom' as const,
    },
    // Sub-passos na página do WhatsApp
    '/connect/whatsapp': [
      {
        selector: '[data-onboarding-target="whatsapp-input"]',
        title: 'Digite seu número',
        description: 'Insira seu número de WhatsApp com DDD (ex: 11 99999-9999). Vamos enviar um link de verificação para confirmar sua identidade.',
        nextLabel: 'Próximo',
        action: 'next-substep', // avança para o próximo sub-passo
        position: 'bottom' as const,
      },
      {
        selector: '[data-onboarding-target="whatsapp-button"]',
        title: 'Envie o link',
        description: 'Agora clique no botão para receber o link de autenticação no seu WhatsApp.',
        nextLabel: 'Entendi',
        action: 'dismiss', // fecha o tooltip para o usuário clicar no botão
        position: 'top' as const,
      },
    ],
  },
  */
};

export const OnboardingOverlay = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    onboardingCompleted,
    onboardingStep,
    updateOnboardingStep,
    completeOnboarding,
    metaConnected,
    whatsappConnected,
    isSubscribed,
    isAuthenticated,
  } = useAuth();

  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [subStep, setSubStep] = useState(0); // Para sub-passos dentro de uma página

  // Pega a configuração atual baseada no passo, página e sub-passo
  const currentConfig = useMemo(() => {
    const stepConfig = ONBOARDING_CONFIG[onboardingStep as 1 | 2];
    if (!stepConfig) return null;
    const pageConfig = stepConfig[location.pathname as keyof typeof stepConfig];
    if (!pageConfig) return null;
    // Se for um array (sub-passos), pega o sub-passo atual
    if (Array.isArray(pageConfig)) {
      return pageConfig[subStep] || null;
    }
    return pageConfig;
  }, [onboardingStep, location.pathname, subStep]);

  // Determina se deve mostrar o onboarding
  // Removido passo 2 (WhatsApp) temporariamente - agora só mostra passo 1 (Meta)
  const shouldShow = isAuthenticated &&
    !onboardingCompleted &&
    !isSubscribed &&
    !dismissed &&
    currentConfig !== null &&
    onboardingStep === 1;

  // Reset dismissed e subStep quando muda de página
  useEffect(() => {
    setDismissed(false);
    setSubStep(0);
  }, [location.pathname]);

  // Fecha overlay quando o elemento alvo é clicado diretamente (só para ação "dismiss")
  useEffect(() => {
    if (!currentConfig || !isVisible) return;
    // Só adiciona listener se a ação atual for "dismiss" (último passo antes de interagir)
    if (currentConfig.action !== 'dismiss') return;

    const element = document.querySelector(currentConfig.selector);
    if (!element) return;

    const handleTargetClick = () => {
      setDismissed(true);
      setIsVisible(false);
    };

    element.addEventListener('click', handleTargetClick);
    return () => {
      element.removeEventListener('click', handleTargetClick);
    };
  }, [currentConfig, isVisible]);

  // Encontra e observa o elemento alvo
  const updateTargetRect = useCallback(() => {
    if (!currentConfig) {
      setTargetRect(null);
      return;
    }

    const element = document.querySelector(currentConfig.selector);

    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        right: rect.right,
        bottom: rect.bottom,
      });
    } else {
      setTargetRect(null);
    }
  }, [currentConfig]);

  // Atualiza posição do elemento quando necessário
  useEffect(() => {
    if (!shouldShow) {
      setIsVisible(false);
      return;
    }

    // Pequeno delay para garantir que o DOM está pronto
    const showTimer = setTimeout(() => {
      updateTargetRect();
      setIsVisible(true);
    }, 300);

    // Atualiza em scroll/resize
    const handleUpdate = () => {
      requestAnimationFrame(updateTargetRect);
    };

    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    // Observer para mudanças no DOM
    const observer = new MutationObserver(handleUpdate);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    return () => {
      clearTimeout(showTimer);
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
      observer.disconnect();
    };
  }, [shouldShow, onboardingStep, updateTargetRect]);

  // Auto-avança quando conexão é feita
  // Removido passo 2 (WhatsApp) temporariamente - completa onboarding após conectar Meta
  useEffect(() => {
    if (onboardingStep === 1 && metaConnected) {
      // Pequeno delay para o usuário ver que conectou
      setTimeout(() => {
        completeOnboarding();
      }, 500);
    }
    /* Passo 2 WhatsApp comentado temporariamente
    else if (onboardingStep === 2 && whatsappConnected) {
      setTimeout(() => {
        completeOnboarding();
      }, 500);
    }
    */
  }, [metaConnected, onboardingStep, completeOnboarding]);

  // Handler para avançar
  const handleNext = useCallback(() => {
    if (!currentConfig) return;

    if (currentConfig.action === 'navigate') {
      // Navega para a página de conexão
      if (onboardingStep === 1) {
        navigate('/connect/meta');
      }
      /* Passo 2 WhatsApp comentado temporariamente
      else if (onboardingStep === 2) {
        navigate('/connect/whatsapp');
      }
      */
    } else if (currentConfig.action === 'next-substep') {
      // Avança para o próximo sub-passo
      setSubStep(prev => prev + 1);
    } else if (currentConfig.action === 'dismiss') {
      // Fecha o tooltip e clica no elemento alvo automaticamente
      setDismissed(true);
      setIsVisible(false);

      // Clica automaticamente no botão alvo
      const element = document.querySelector(currentConfig.selector) as HTMLElement;
      if (element) {
        setTimeout(() => {
          element.click();
        }, 100);
      }
    }
  }, [currentConfig, onboardingStep, navigate]);

  // Handler para pular - apenas fecha temporariamente, não completa o onboarding
  // Removido passo 2 (WhatsApp) temporariamente - pular apenas fecha o overlay
  const handleSkip = useCallback(async () => {
    setIsVisible(false);
    setDismissed(true);
    // Apenas fecha temporariamente - volta a aparecer ao navegar
    /* Passo 2 WhatsApp comentado temporariamente
    if (onboardingStep === 1) {
      setTimeout(async () => {
        await updateOnboardingStep(2);
      }, 200);
    }
    */
  }, []);

  // Não renderiza se não deve mostrar ou não está visível
  if (!shouldShow || !isVisible || !currentConfig) return null;

  // Gera o clip-path para o spotlight
  const getClipPath = () => {
    if (!targetRect) return 'none';

    const padding = 8;
    const borderRadius = 16;

    const x = targetRect.left - padding;
    const y = targetRect.top - padding;
    const w = targetRect.width + padding * 2;
    const h = targetRect.height + padding * 2;

    // Cria um path que cobre toda a tela exceto o retângulo do spotlight
    return `
      polygon(
        0% 0%,
        0% 100%,
        ${x}px 100%,
        ${x}px ${y + borderRadius}px,
        ${x + borderRadius}px ${y}px,
        ${x + w - borderRadius}px ${y}px,
        ${x + w}px ${y + borderRadius}px,
        ${x + w}px ${y + h - borderRadius}px,
        ${x + w - borderRadius}px ${y + h}px,
        ${x + borderRadius}px ${y + h}px,
        ${x}px ${y + h - borderRadius}px,
        ${x}px 100%,
        100% 100%,
        100% 0%
      )
    `;
  };

  return (
    <>
      {/* Overlay escuro com spotlight */}
      <div
        className="fixed inset-0 z-[100] transition-opacity duration-300"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          clipPath: targetRect ? getClipPath() : 'none',
        }}
        onClick={(e) => {
          // Não fecha se clicar no overlay (apenas no botão pular)
          e.stopPropagation();
        }}
      />

      {/* Borda brilhante ao redor do spotlight */}
      {targetRect && (
        <div
          className="fixed z-[101] pointer-events-none rounded-2xl animate-pulse"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            boxShadow: '0 0 0 3px rgba(70, 204, 198, 0.5), 0 0 20px rgba(70, 204, 198, 0.3)',
          }}
        />
      )}

      {/* Tooltip */}
      {/* totalSteps alterado de 2 para 1 (WhatsApp removido temporariamente) */}
      <OnboardingTooltip
        title={currentConfig.title}
        description={currentConfig.description}
        stepNumber={onboardingStep}
        totalSteps={1}
        position={currentConfig.position}
        targetRect={targetRect as DOMRect | null}
        onNext={handleNext}
        onSkip={handleSkip}
        nextLabel={currentConfig.nextLabel}
        isLastStep={onboardingStep === 1 && location.pathname === '/connect/meta'}
      />
    </>
  );
};
