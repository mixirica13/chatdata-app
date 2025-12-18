import { Button } from '@/components/ui/button';
import { ChevronRight, X } from 'lucide-react';

interface OnboardingTooltipProps {
  title: string;
  description: string;
  stepNumber: number;
  totalSteps: number;
  position: 'top' | 'bottom' | 'left' | 'right';
  targetRect: DOMRect | null;
  onNext: () => void;
  onSkip: () => void;
  nextLabel?: string;
  isLastStep?: boolean;
}

export const OnboardingTooltip = ({
  title,
  description,
  stepNumber,
  totalSteps,
  position,
  targetRect,
  onNext,
  onSkip,
  nextLabel = 'Continuar',
  isLastStep = false,
}: OnboardingTooltipProps) => {
  if (!targetRect) return null;

  // Calcula posição do tooltip baseado no elemento alvo
  const getTooltipStyle = (): React.CSSProperties => {
    const padding = 16;
    const tooltipWidth = 340;
    const arrowSize = 12;

    // Centraliza horizontalmente em relação ao elemento alvo
    let left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
    let top = 0;
    let transform = '';

    // Ajusta para não sair da tela
    const minLeft = padding;
    const maxLeft = window.innerWidth - tooltipWidth - padding;
    left = Math.max(minLeft, Math.min(maxLeft, left));

    switch (position) {
      case 'bottom':
        top = targetRect.bottom + arrowSize + padding;
        break;
      case 'top':
        // Posiciona o FUNDO do tooltip acima do elemento
        top = targetRect.top - arrowSize - padding;
        transform = 'translateY(-100%)';
        break;
      case 'left':
        left = targetRect.left - tooltipWidth - arrowSize - padding;
        top = targetRect.top + targetRect.height / 2;
        transform = 'translateY(-50%)';
        break;
      case 'right':
        left = targetRect.right + arrowSize + padding;
        top = targetRect.top + targetRect.height / 2;
        transform = 'translateY(-50%)';
        break;
    }

    return {
      position: 'fixed',
      left: `${left}px`,
      top: `${top}px`,
      width: `${tooltipWidth}px`,
      zIndex: 110,
      ...(transform && { transform }),
    };
  };

  // Calcula posição da seta
  const getArrowStyle = (): React.CSSProperties => {
    const arrowSize = 12;
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      width: 0,
      height: 0,
    };

    switch (position) {
      case 'bottom':
        return {
          ...baseStyle,
          top: `-${arrowSize}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: `${arrowSize}px solid transparent`,
          borderRight: `${arrowSize}px solid transparent`,
          borderBottom: `${arrowSize}px solid rgb(39, 39, 42)`,
        };
      case 'top':
        return {
          ...baseStyle,
          bottom: `-${arrowSize}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: `${arrowSize}px solid transparent`,
          borderRight: `${arrowSize}px solid transparent`,
          borderTop: `${arrowSize}px solid rgb(39, 39, 42)`,
        };
      case 'left':
        return {
          ...baseStyle,
          right: `-${arrowSize}px`,
          top: '50%',
          transform: 'translateY(-50%)',
          borderTop: `${arrowSize}px solid transparent`,
          borderBottom: `${arrowSize}px solid transparent`,
          borderLeft: `${arrowSize}px solid rgb(39, 39, 42)`,
        };
      case 'right':
        return {
          ...baseStyle,
          left: `-${arrowSize}px`,
          top: '50%',
          transform: 'translateY(-50%)',
          borderTop: `${arrowSize}px solid transparent`,
          borderBottom: `${arrowSize}px solid transparent`,
          borderRight: `${arrowSize}px solid rgb(39, 39, 42)`,
        };
    }
  };

  return (
    <div
      style={getTooltipStyle()}
      className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300"
    >
      {/* Seta do tooltip */}
      <div style={getArrowStyle()} />

      {/* Card do tooltip */}
      <div className="bg-zinc-800 rounded-2xl border border-[#46CCC6]/30 shadow-xl shadow-black/50 overflow-hidden">
        {/* Header com progresso */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/50 border-b border-white/5">
          <span className="text-sm text-[#46CCC6] font-medium">
            Passo {stepNumber} de {totalSteps}
          </span>
          <button
            onClick={onSkip}
            className="text-white/40 hover:text-white/60 transition-colors"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-4 space-y-3">
          <h3 className="text-lg font-semibold text-white">
            {title}
          </h3>
          <p className="text-sm text-white/70 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Footer com botões */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-zinc-900/30 border-t border-white/5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="text-white/50 hover:text-white hover:bg-white/5"
          >
            Pular por agora
          </Button>
          <Button
            size="sm"
            onClick={onNext}
            className="bg-[#46CCC6] hover:bg-[#46CCC6]/90 text-black font-semibold gap-1"
          >
            {isLastStep ? 'Concluir' : nextLabel}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
