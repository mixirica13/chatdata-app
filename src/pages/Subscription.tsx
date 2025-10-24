import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LiquidGlass } from '@/components/LiquidGlass';
import { BottomNav } from '@/components/BottomNav';
import { Logo } from '@/components/Logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Loader2, CreditCard, FileText, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Subscription = () => {
  const { isSubscribed, subscriptionEnd, cancelAtPeriodEnd, checkSubscription } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [canceledDate, setCanceledDate] = useState<string>('');

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
        toast.success('Redirecionando para o checkout...');
      } else {
        toast.error('Erro: Nenhuma URL de checkout retornada');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao iniciar checkout');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManagePayment = async () => {
    setIsPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
        toast.success('Redirecionando para o portal de gerenciamento...');
      } else {
        toast.error('Erro: Nenhuma URL do portal retornada');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao abrir portal de gerenciamento');
    } finally {
      setIsPortalLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCanceling(true);
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription');

      if (error) throw error;

      if (data?.success) {
        await checkSubscription();

        // Formatar a data em português brasileiro
        const periodEnd = data.periodEnd ? new Date(data.periodEnd).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        }) : '';

        setCanceledDate(periodEnd);
        setShowSuccessDialog(true);
      } else {
        toast.error('Erro ao cancelar assinatura');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cancelar assinatura');
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black flex flex-col p-6 pb-32">
      {/* Logo fixa no header */}
      <div className="w-full flex justify-center pt-0 pb-4">
        <Logo className="h-16 w-auto" />
      </div>

      <div className="w-full max-w-2xl mx-auto space-y-6">
        {isSubscribed && (
          <LiquidGlass>
            <Card className="bg-transparent border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Crown className="w-5 h-5 text-[#46CCC6]" />
                      Plano Ativo
                    </CardTitle>
                    <CardDescription className="text-white/60">
                      Você tem acesso a todos os recursos premium
                    </CardDescription>
                  </div>
                  <Badge className="bg-[#46CCC6] text-black">
                    Ativo
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cancelAtPeriodEnd && subscriptionEnd && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
                      <p className="text-sm text-yellow-500 font-semibold flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        Assinatura será cancelada
                      </p>
                      <p className="text-sm text-yellow-500/80 mt-1">
                        Você terá acesso até: {new Date(subscriptionEnd).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}
                  {subscriptionEnd && !cancelAtPeriodEnd && (
                    <p className="text-sm text-white/60">
                      Renovação em: {new Date(subscriptionEnd).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                  <div className="flex flex-col gap-3">
                    <Button
                      variant="outline"
                      onClick={handleManagePayment}
                      disabled={isPortalLoading}
                      className="border-white/20 text-white hover:bg-white/10 w-full"
                    >
                      {isPortalLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CreditCard className="mr-2 h-4 w-4" />
                      )}
                      Gerenciar Pagamento
                    </Button>
                    {!cancelAtPeriodEnd && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            disabled={isCanceling}
                            className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full"
                          >
                            {isCanceling ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="mr-2 h-4 w-4" />
                            )}
                            Cancelar Assinatura
                          </Button>
                        </AlertDialogTrigger>
                      <AlertDialogContent className="bg-zinc-900 border-white/10">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">
                            Tem certeza que deseja cancelar?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-white/60">
                            Sua assinatura permanecerá ativa até o final do período de cobrança atual.
                            Você perderá acesso aos recursos premium após essa data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-transparent border-white/20 text-white hover:bg-white/10">
                            Manter Assinatura
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleCancelSubscription}
                            className="bg-red-600 text-white hover:bg-red-700"
                          >
                            Sim, Cancelar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </LiquidGlass>
        )}

        <LiquidGlass>
          <Card className="bg-transparent border-0">
            <CardHeader>
              <CardTitle className="text-white">Plano Premium</CardTitle>
              <CardDescription className="text-white/60">
                Acesso completo à plataforma de insights com IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-4xl font-bold text-[#46CCC6]">
                R$ 99,00 <span className="text-lg font-normal text-white/60">/mês</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-white">
                  <Check className="w-5 h-5 text-[#46CCC6]" />
                  <span>Insights ilimitados via WhatsApp</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <Check className="w-5 h-5 text-[#46CCC6]" />
                  <span>Análise de campanhas em tempo real</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <Check className="w-5 h-5 text-[#46CCC6]" />
                  <span>Recomendações personalizadas com IA</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <Check className="w-5 h-5 text-[#46CCC6]" />
                  <span>Relatórios detalhados de performance</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <Check className="w-5 h-5 text-[#46CCC6]" />
                  <span>Suporte prioritário</span>
                </div>
              </div>

              {!isSubscribed && (
                <Button
                  size="lg"
                  className="w-full bg-[#46CCC6] hover:bg-[#46CCC6]/90 text-black font-semibold"
                  onClick={handleSubscribe}
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Assinar Agora
                </Button>
              )}
            </CardContent>
          </Card>
        </LiquidGlass>
      </div>

      {/* Dialog de Sucesso do Cancelamento */}
      <AlertDialog open={showSuccessDialog} onOpenChange={(open) => {
        if (!open) {
          window.location.reload();
        }
      }}>
        <AlertDialogContent className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-[#46CCC6]/20 max-w-md">
          <AlertDialogHeader>
            <div className="flex flex-col items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-[#46CCC6]/10 flex items-center justify-center">
                <Check className="w-8 h-8 text-[#46CCC6]" />
              </div>
              <AlertDialogTitle className="text-white text-2xl text-center">
                Assinatura Cancelada
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-white/80 text-center space-y-4">
              <p className="text-lg">
                Sua assinatura foi cancelada com sucesso.
              </p>
              <div className="bg-[#46CCC6]/10 border border-[#46CCC6]/20 rounded-lg p-4">
                <p className="text-sm text-white/60 mb-2">
                  Você continuará com acesso premium até:
                </p>
                <p className="text-xl font-semibold text-[#46CCC6]">
                  {canceledDate}
                </p>
              </div>
              <p className="text-sm text-white/60">
                Após essa data, você perderá acesso aos recursos premium.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-col gap-2">
            <AlertDialogAction
              onClick={() => window.location.reload()}
              className="w-full bg-[#46CCC6] text-black hover:bg-[#46CCC6]/90 font-semibold"
            >
              Entendi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  );
};

export default Subscription;
