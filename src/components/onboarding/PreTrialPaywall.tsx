import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Zap, Check, X } from 'lucide-react';

interface PreTrialPaywallProps {
  isOpen: boolean;
  onClose: () => void;
  requestsUsed: number;
  requestsLimit: number;
}

const BENEFITS = [
  '50 análises de IA por dia',
  'Insights personalizados em tempo real',
  'Alertas de performance no WhatsApp',
  'Recomendações de otimização',
  'Suporte prioritário',
];

export const PreTrialPaywall = ({
  isOpen,
  onClose,
  requestsUsed,
  requestsLimit,
}: PreTrialPaywallProps) => {
  const navigate = useNavigate();

  const handleStartTrial = () => {
    onClose();
    navigate('/subscription');
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-black border-2 border-[#46CCC6]/30 max-w-md rounded-2xl p-0 overflow-hidden">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-br from-[#46CCC6]/20 to-transparent p-6 pb-4">
          <AlertDialogHeader className="space-y-4">
            {/* Ícone */}
            <div className="flex justify-center">
              <div className="bg-[#46CCC6] rounded-full p-4 shadow-lg shadow-[#46CCC6]/30">
                <Zap className="h-8 w-8 text-black" />
              </div>
            </div>

            {/* Título */}
            <AlertDialogTitle className="text-2xl font-bold text-white text-center">
              Você usou suas {requestsLimit} análises gratuitas!
            </AlertDialogTitle>

            {/* Descrição */}
            <AlertDialogDescription className="text-gray-400 text-center">
              Para continuar usando a IA ChatData e desbloquear todo o potencial
              das suas campanhas, inicie seu trial gratuito de 7 dias.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        {/* Contador visual */}
        <div className="px-6 pb-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/60">Análises utilizadas</span>
              <span className="text-sm font-semibold text-[#46CCC6]">
                {requestsUsed}/{requestsLimit}
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#46CCC6] to-[#46CCC6]/70 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (requestsUsed / requestsLimit) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Lista de benefícios */}
        <div className="px-6 pb-4">
          <h4 className="text-sm font-semibold text-white/80 mb-3">
            Incluído no trial:
          </h4>
          <ul className="space-y-2">
            {BENEFITS.map((benefit, index) => (
              <li key={index} className="flex items-center gap-3 text-sm text-white/70">
                <div className="flex-shrink-0 w-5 h-5 bg-[#46CCC6]/20 rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-[#46CCC6]" />
                </div>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer com botões */}
        <AlertDialogFooter className="flex flex-col gap-3 px-6 py-4 bg-zinc-900/50 border-t border-white/5">
          <Button
            onClick={handleStartTrial}
            className="w-full bg-[#46CCC6] hover:bg-[#46CCC6]/90 text-black font-semibold py-6 text-base rounded-xl shadow-lg shadow-[#46CCC6]/20"
          >
            <Zap className="h-5 w-5 mr-2" />
            Iniciar Trial Gratuito de 7 dias
          </Button>

          <button
            onClick={onClose}
            className="text-sm text-white/40 hover:text-white/60 transition-colors py-2"
          >
            Talvez depois
          </button>
        </AlertDialogFooter>

        {/* Botão de fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white/60 transition-colors"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>
      </AlertDialogContent>
    </AlertDialog>
  );
};
