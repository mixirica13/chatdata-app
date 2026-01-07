import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ConnectionCard } from '@/components/ConnectionCard';
import { LiquidGlass } from '@/components/LiquidGlass';
import { BottomNav } from '@/components/BottomNav';
import { Logo } from '@/components/Logo';
import { WhatsAppIcon } from '@/components/WhatsAppIcon';
import { Facebook, Bot, Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useTracking } from '@/hooks/useTracking';
import { usePreTrial } from '@/hooks/usePreTrial';
import { PreTrialPaywall } from '@/components/onboarding';

const Dashboard = () => {
  const navigate = useNavigate();
  const { metaConnected, disconnectMeta, whatsappConnected, disconnectWhatsapp, onboardingStep, onboardingCompleted, updateOnboardingStep } = useAuth();
  const [showConnectionAlert, setShowConnectionAlert] = useState(false);
  const [showDisconnectMetaAlert, setShowDisconnectMetaAlert] = useState(false);
  const [showDisconnectWhatsappAlert, setShowDisconnectWhatsappAlert] = useState(false);
  const [showMcpInstructions, setShowMcpInstructions] = useState(false);
  const [mcpUrlCopied, setMcpUrlCopied] = useState(false);

  // MCP Server URL from environment
  const mcpServerUrl = import.meta.env.VITE_MCP_SERVER_URL || 'https://meta-ads-mcp-server.chatdata.workers.dev/sse';
  const { trackEvent, trackPageView } = useTracking();
  const {
    showPaywall,
    setShowPaywall,
    requestsUsed,
    requestsLimit,
    hasReachedLimit,
    checkAndShowPaywall,
  } = usePreTrial();

  // Track dashboard view
  useEffect(() => {
    trackPageView('dashboard');
    trackEvent('dashboard_viewed');
  }, [trackPageView, trackEvent]);

  // Onboarding desativado
  // useEffect(() => {
  //   const startOnboarding = async () => {
  //     // Se onboarding não foi iniciado ainda (step 0) e não está concluído
  //     if (onboardingStep === 0 && !onboardingCompleted) {
  //       // Se já conectou Meta, pula para passo 2
  //       if (metaConnected) {
  //         if (whatsappConnected) {
  //           // Já conectou ambos, não precisa de onboarding
  //           return;
  //         }
  //         await updateOnboardingStep(2);
  //       } else {
  //         // Começa do passo 1
  //         await updateOnboardingStep(1);
  //       }
  //     }
  //   };

  //   startOnboarding();
  // }, [onboardingStep, onboardingCompleted, metaConnected, whatsappConnected, updateOnboardingStep]);

  // Verifica limite de pre-trial ao carregar
  useEffect(() => {
    if (hasReachedLimit) {
      setShowPaywall(true);
    }
  }, [hasReachedLimit, setShowPaywall]);

  const handleAgentClick = async () => {
    if (!metaConnected || !whatsappConnected) {
      setShowConnectionAlert(true);
      return;
    }

    // Verifica limite de pre-trial antes de abrir conversa
    const shouldBlock = await checkAndShowPaywall();
    if (shouldBlock) {
      return;
    }

    window.open('https://wa.me/YOUR_WHATSAPP_NUMBER', '_blank');
  };

  const handleDisconnectMeta = async () => {
    try {
      await disconnectMeta();
      setShowDisconnectMetaAlert(false);
      toast.success('Meta Ads desconectado com sucesso!');
    } catch (error) {
      console.error('Error disconnecting Meta:', error);
      toast.error('Erro ao desconectar Meta Ads. Tente novamente.');
    }
  };

  const handleDisconnectWhatsapp = async () => {
    try {
      await disconnectWhatsapp();
      setShowDisconnectWhatsappAlert(false);
      toast.success('WhatsApp desconectado com sucesso!');
    } catch (error) {
      console.error('Error disconnecting WhatsApp:', error);
      toast.error('Erro ao desconectar WhatsApp. Tente novamente.');
    }
  };

  const handleCopyMcpUrl = async () => {
    try {
      await navigator.clipboard.writeText(mcpServerUrl);
      setMcpUrlCopied(true);
      toast.success('URL copiada!');
      setTimeout(() => setMcpUrlCopied(false), 2000);
    } catch (error) {
      console.error('Error copying URL:', error);
      toast.error('Erro ao copiar URL');
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
          {/* Card Meta Ads - data attribute para onboarding */}
          <div data-onboarding-target="meta">
            <LiquidGlass className="p-1">
              <ConnectionCard
                title="Meta Ads"
                description="Conecte sua conta de anúncios do Facebook"
                icon={Facebook}
                connected={metaConnected}
                onConnect={() => navigate('/connect/meta')}
                onDisconnect={() => setShowDisconnectMetaAlert(true)}
              />
            </LiquidGlass>
          </div>

          {/* Card MCP - Claude Integration */}
          <LiquidGlass className="p-1">
            <div className="bg-gradient-to-br from-[#D97706]/10 to-[#D97706]/5 backdrop-blur-sm rounded-2xl p-4 border border-[#D97706]/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-[#D97706]/20 p-2 rounded-lg">
                    <Bot className="w-5 h-5 text-[#D97706]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">MCP para Claude</h3>
                    <p className="text-sm text-gray-400">Conecte o Claude AI aos seus dados</p>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Button
                  onClick={() => setShowMcpInstructions(true)}
                  className="w-full bg-[#D97706] hover:bg-[#D97706]/90 text-white font-semibold"
                >
                  Conectar
                </Button>
              </div>
            </div>
          </LiquidGlass>

          {/* WhatsApp Section - Hidden */}
          {/*
          <>
              <div data-onboarding-target="whatsapp">
                <LiquidGlass className="p-1">
                  <ConnectionCard
                    title="WhatsApp"
                    description="Autentique seu número para usar a IA via WhatsApp"
                    icon={WhatsAppIcon}
                    connected={whatsappConnected}
                    onConnect={() => navigate('/connect/whatsapp')}
                    onDisconnect={() => setShowDisconnectWhatsappAlert(true)}
                  />
                </LiquidGlass>
              </div>

              <LiquidGlass className="p-1">
                <div className="bg-gradient-to-br from-[#46CCC6]/10 to-[#46CCC6]/5 backdrop-blur-sm rounded-2xl p-6 border border-[#46CCC6]/20">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-[#46CCC6] rounded-full p-3">
                      <WhatsAppIcon className="h-8 w-8 text-black" />
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
            </>
          */}
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
                    <WhatsAppIcon className={`h-6 w-6 ${
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

      {/* Alert Dialog para confirmar desconexão Meta */}
      <AlertDialog open={showDisconnectMetaAlert} onOpenChange={setShowDisconnectMetaAlert}>
        <AlertDialogContent className="bg-black border-2 border-red-500/30 max-w-md rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-white text-center">
              Desconectar Meta Ads?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400 text-center pt-2">
              Isso irá remover todas as suas credenciais e dados de conexão com o Meta Ads. Você precisará conectar novamente para acessar suas métricas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel className="bg-white/5 text-white border-white/10 hover:bg-white/10">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-white hover:bg-red-600 font-semibold"
              onClick={handleDisconnectMeta}
            >
              Desconectar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Dialog para confirmar desconexão WhatsApp */}
      <AlertDialog open={showDisconnectWhatsappAlert} onOpenChange={setShowDisconnectWhatsappAlert}>
        <AlertDialogContent className="bg-black border-2 border-red-500/30 max-w-md rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-white text-center">
              Desconectar WhatsApp?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400 text-center pt-2">
              Isso irá remover sua autenticação do WhatsApp. Você precisará autenticar novamente para usar o Agente de IA.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel className="bg-white/5 text-white border-white/10 hover:bg-white/10">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-white hover:bg-red-600 font-semibold"
              onClick={handleDisconnectWhatsapp}
            >
              Desconectar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Paywall para Pre-Trial */}
      <PreTrialPaywall
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        requestsUsed={requestsUsed}
        requestsLimit={requestsLimit}
      />

      {/* Modal de Instruções do MCP */}
      <AlertDialog open={showMcpInstructions} onOpenChange={setShowMcpInstructions}>
        <AlertDialogContent className="bg-black border-2 border-[#D97706]/30 max-w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <AlertDialogHeader className="flex-shrink-0">
            <AlertDialogTitle className="text-xl font-bold text-white text-center">
              Conectar ao Claude
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400 text-center pt-1 text-sm">
              Siga os passos abaixo para conectar seus dados ao Claude AI
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3 py-3 overflow-y-auto flex-1 min-h-0">
            {/* URL do MCP com botão de copiar */}
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-xs text-gray-400 mb-2">URL do Servidor MCP:</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0 bg-black/50 rounded-lg p-2 overflow-hidden">
                  <code className="text-[#D97706] text-xs block truncate">
                    {mcpServerUrl}
                  </code>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyMcpUrl}
                  className="bg-transparent border-[#D97706]/30 text-[#D97706] hover:bg-[#D97706]/10 flex-shrink-0 h-8 w-8 p-0"
                >
                  {mcpUrlCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Passos */}
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#D97706] text-black text-xs font-bold flex-shrink-0 mt-0.5">
                  1
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm">
                    Acesse os conectores do Claude
                  </p>
                  <a
                    href="https://claude.ai/settings/connectors"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#D97706] text-xs hover:underline"
                  >
                    claude.ai/settings/connectors
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#D97706] text-black text-xs font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <p className="text-white text-sm">
                  Clique em <span className="text-[#D97706] font-medium">"Adicionar conector"</span>
                </p>
              </div>

              <div className="flex items-start gap-2">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#D97706] text-black text-xs font-bold flex-shrink-0 mt-0.5">
                  3
                </div>
                <p className="text-white text-sm">
                  Cole a URL e clique em <span className="text-[#D97706] font-medium">"Adicionar"</span>
                </p>
              </div>

              <div className="flex items-start gap-2">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#D97706] text-black text-xs font-bold flex-shrink-0 mt-0.5">
                  4
                </div>
                <p className="text-white text-sm">
                  Clique em <span className="text-[#D97706] font-medium">"Veicular"</span> para autenticar
                </p>
              </div>
            </div>

            {/* Nota */}
            <div className="bg-[#D97706]/10 rounded-lg p-2 border border-[#D97706]/20">
              <p className="text-xs text-[#D97706]">
                Após conectar, use o Claude para analisar seus dados do Meta Ads.
              </p>
            </div>
          </div>

          <AlertDialogFooter className="flex-shrink-0 gap-2 sm:gap-2 pt-2">
            <AlertDialogCancel className="bg-white/5 text-white border-white/10 hover:bg-white/10">
              Fechar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#D97706] text-white hover:bg-[#D97706]/90 font-semibold"
              onClick={() => {
                window.open('https://claude.ai/settings/connectors', '_blank');
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir Claude
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
