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
  // Passo 2: Conectar WhatsApp
  2: {
    '/dashboard': {
      selector: '[data-onboarding-target="whatsapp"]',
      title: 'Autentique seu WhatsApp',
      description: 'Vincule seu número de WhatsApp para receber insights diretamente no seu celular. A IA ChatData vai te enviar análises, alertas e recomendações de otimização das suas campanhas.',
      nextLabel: 'Conectar',
      action: 'navigate', // navega para /connect/whatsapp
      position: 'bottom' as const,
    },
    '/connect/whatsapp': {
      selector: '[data-onboarding-target="whatsapp-button"]',
      title: 'Envie o link de autenticação',
      description: 'Digite seu número de WhatsApp acima e clique neste botão. Você receberá um link de verificação no seu WhatsApp para confirmar sua identidade.',
      nextLabel: 'Entendi',
      action: 'dismiss', // fecha o tooltip para o usuário clicar no botão
      position: 'top' as const,
    },
  },
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

  // Pega a configuração atual baseada no passo e na página
  const currentConfig = useMemo(() => {
    const stepConfig = ONBOARDING_CONFIG[onboardingStep as 1 | 2];
    if (!stepConfig) return null;
    return stepConfig[location.pathname as keyof typeof stepConfig] || null;
  }, [onboardingStep, location.pathname]);

  // Determina se deve mostrar o onboarding
  const shouldShow = isAuthenticated &&
    !onboardingCompleted &&
    !isSubscribed &&
    !dismissed &&
    currentConfig !== null &&
    (onboardingStep === 1 || onboardingStep === 2);

  // Reset dismissed quando muda de página
  useEffect(() => {
    setDismissed(false);
  }, [location.pathname]);

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
  useEffect(() => {
    if (onboardingStep === 1 && metaConnected) {
      // Pequeno delay para o usuário ver que conectou
      setTimeout(() => {
        if (whatsappConnected) {
          completeOnboarding();
        } else {
          updateOnboardingStep(2);
        }
      }, 500);
    } else if (onboardingStep === 2 && whatsappConnected) {
      setTimeout(() => {
        completeOnboarding();
      }, 500);
    }
  }, [metaConnected, whatsappConnected, onboardingStep, updateOnboardingStep, completeOnboarding]);

  // Handler para avançar
  const handleNext = useCallback(() => {
    if (!currentConfig) return;

    if (currentConfig.action === 'navigate') {
      // Navega para a página de conexão
      if (onboardingStep === 1) {
        navigate('/connect/meta');
      } else if (onboardingStep === 2) {
        navigate('/connect/whatsapp');
      }
    } else if (currentConfig.action === 'dismiss') {
      // Apenas fecha o tooltip para o usuário interagir com o elemento
      setDismissed(true);
      setIsVisible(false);
    }
  }, [currentConfig, onboardingStep, navigate]);

  // Handler para pular
  const handleSkip = useCallback(async () => {
    setIsVisible(false);
    setDismissed(true);
    setTimeout(async () => {
      if (onboardingStep === 1) {
        await updateOnboardingStep(2);
      } else {
        await completeOnboarding();
      }
    }, 200);
  }, [onboardingStep, updateOnboardingStep, completeOnboarding]);

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
      <OnboardingTooltip
        title={currentConfig.title}
        description={currentConfig.description}
        stepNumber={onboardingStep}
        totalSteps={2}
        position={currentConfig.position}
        targetRect={targetRect as DOMRect | null}
        onNext={handleNext}
        onSkip={handleSkip}
        nextLabel={currentConfig.nextLabel}
        isLastStep={onboardingStep === 2 && location.pathname === '/connect/whatsapp'}
      />
    </>
  );
};
