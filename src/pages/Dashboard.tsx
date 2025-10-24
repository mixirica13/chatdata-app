import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ConnectionCard } from '@/components/ConnectionCard';
import { LiquidGlass } from '@/components/LiquidGlass';
import { BottomNav } from '@/components/BottomNav';
import { Logo } from '@/components/Logo';
import { WhatsAppIcon } from '@/components/WhatsAppIcon';
import { Facebook, MessageCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { metaConnected, disconnectMeta, whatsappConnected, disconnectWhatsapp } = useAuth();
  const [showConnectionAlert, setShowConnectionAlert] = useState(false);

  const handleAgentClick = () => {
    if (!metaConnected || !whatsappConnected) {
      setShowConnectionAlert(true);
    } else {
      window.open('https://wa.me/YOUR_WHATSAPP_NUMBER', '_blank');
    }
  };

  return (
    <div className="min-h-screen w-full bg-black flex flex-col p-6 pb-32">
      {/* Logo fixa no header */}
      <div className="w-full flex justify-center pt-0 pb-4">
        <Logo className="h-16 w-auto" />
      </div>

      {/* Content centralizado */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md space-y-4">
          <LiquidGlass className="p-1">
            <ConnectionCard
              title="Meta Ads"
              description="Conecte sua conta de anúncios do Facebook"
              icon={Facebook}
              connected={metaConnected}
              onConnect={() => navigate('/connect/meta')}
              onDisconnect={disconnectMeta}
            />
          </LiquidGlass>

          <LiquidGlass className="p-1">
            <ConnectionCard
              title="WhatsApp"
              description="Autentique seu número para usar a IA via WhatsApp"
              icon={MessageCircle}
              connected={whatsappConnected}
              onConnect={() => navigate('/connect/whatsapp')}
              onDisconnect={disconnectWhatsapp}
            />
          </LiquidGlass>

          {/* Box do Agente de IA */}
          <LiquidGlass className="p-1">
            <div className="bg-gradient-to-br from-[#46CCC6]/10 to-[#46CCC6]/5 backdrop-blur-sm rounded-2xl p-6 border border-[#46CCC6]/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-[#46CCC6] rounded-full p-3">
                  <MessageCircle className="h-8 w-8 text-black" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-1">
                    Agente de IA
                  </h3>
                  <p className="text-sm text-gray-300">
                    Converse com nosso assistente via WhatsApp
                  </p>
                </div>
              </div>

              <button
                onClick={handleAgentClick}
                className="w-full bg-[#46CCC6] hover:bg-[#46CCC6]/90 text-black font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#46CCC6]/20"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Iniciar Conversa no WhatsApp
              </button>
            </div>
          </LiquidGlass>
        </div>
      </div>

      {/* Menu de navegação inferior */}
      <BottomNav />

      {/* Alert Dialog para conexões necessárias */}
      <AlertDialog open={showConnectionAlert} onOpenChange={setShowConnectionAlert}>
        <AlertDialogContent className="bg-black border-2 border-[#46CCC6]/30 max-w-md rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-white text-center">
              Conexões Necessárias
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400 text-center pt-2">
              Para falar com o Agente de IA, conecte suas contas primeiro
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-6">
            {/* Passo 1: Meta Ads */}
            <div className={`relative rounded-xl p-4 border-2 transition-all ${
              metaConnected
                ? 'bg-[#46CCC6]/10 border-[#46CCC6]/50'
                : 'bg-white/5 border-white/10'
            }`}>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={`rounded-full p-2.5 ${
                    metaConnected ? 'bg-[#46CCC6]' : 'bg-white/10'
                  }`}>
                    <Facebook className={`h-6 w-6 ${
                      metaConnected ? 'text-black' : 'text-white/50'
                    }`} />
                  </div>
                  <div className={`absolute -top-1 -right-1 flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                    metaConnected ? 'bg-[#46CCC6] text-black' : 'bg-white/20 text-white'
                  }`}>
                    1
                  </div>
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${
                    metaConnected ? 'text-[#46CCC6]' : 'text-white'
                  }`}>
                    Conectar Meta Ads
                  </p>
                  <p className="text-sm text-gray-400">
                    {metaConnected ? '✓ Conectado' : 'Conecte sua conta de anúncios'}
                  </p>
                </div>
              </div>
            </div>

            {/* Passo 2: WhatsApp */}
            <div className={`relative rounded-xl p-4 border-2 transition-all ${
              whatsappConnected
                ? 'bg-[#46CCC6]/10 border-[#46CCC6]/50'
                : 'bg-white/5 border-white/10'
            }`}>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={`rounded-full p-2.5 ${
                    whatsappConnected ? 'bg-[#46CCC6]' : 'bg-white/10'
                  }`}>
                    <MessageCircle className={`h-6 w-6 ${
                      whatsappConnected ? 'text-black' : 'text-white/50'
                    }`} />
                  </div>
                  <div className={`absolute -top-1 -right-1 flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                    whatsappConnected ? 'bg-[#46CCC6] text-black' : 'bg-white/20 text-white'
                  }`}>
                    2
                  </div>
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${
                    whatsappConnected ? 'text-[#46CCC6]' : 'text-white'
                  }`}>
                    Autenticar WhatsApp
                  </p>
                  <p className="text-sm text-gray-400">
                    {whatsappConnected ? '✓ Conectado' : 'Autentique seu número'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel className="bg-white/5 text-white border-white/10 hover:bg-white/10">
              Fechar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#46CCC6] text-black hover:bg-[#46CCC6]/90 font-semibold"
              onClick={() => {
                setShowConnectionAlert(false);
                if (!metaConnected) {
                  navigate('/connect/meta');
                } else if (!whatsappConnected) {
                  navigate('/connect/whatsapp');
                }
              }}
            >
              Conectar Agora
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
