import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LiquidGlass } from '@/components/LiquidGlass';
import { BottomNav } from '@/components/BottomNav';
import { Logo } from '@/components/Logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Loader2, CreditCard, XCircle, Zap, Rocket, TrendingUp, BarChart3, AlertTriangle, DollarSign, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTracking } from '@/hooks/useTracking';
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

type PlanType = 'basic' | 'pro' | 'agency';

interface Plan {
  id: PlanType;
  name: string;
  icon: React.ElementType;
  price: string;
  priceId: string;
  description: string;
  features: string[];
  popular: boolean;
  requestLimit: string;
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    icon: Zap,
    price: 'R$ 47',
    priceId: 'price_1SWm28A76CJavEvOTQu7kLC1',
    description: 'Ideal para começar com IA',
    features: [
      'Acesso à IA ChatData no WhatsApp',
      'Dashboard geral com métricas principais',
      '50 requisições/dia',
    ],
    popular: true,
    requestLimit: '50 requisições/dia',
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: TrendingUp,
    price: 'R$ 97',
    priceId: 'price_1SWlyAA76CJavEvOEXapiskH',
    description: 'Para profissionais que buscam mais',
    features: [
      'Acesso à IA ChatData no WhatsApp',
      'Dashboard customizável',
      'Burn-up chart para acompanhamento',
      'Controle de gastos detalhado',
      'Alerta de saldo para contas pré-pagas',
      '100 requisições/dia',
    ],
    popular: false,
    requestLimit: '100 requisições/dia',
  },
  {
    id: 'agency',
    name: 'Agency',
    icon: Rocket,
    price: 'R$ 197',
    priceId: 'price_1SWlxaA76CJavEvOS0FdYuNb',
    description: 'Solução completa para agências',
    features: [
      'Todos os recursos do Pro',
      'Dashboard customizável avançado',
      'Burn-up chart detalhado',
      'Controle completo de gastos',
      'Alertas personalizados',
      'Requisições ilimitadas',
    ],
    popular: false,
    requestLimit: 'Requisições ilimitadas',
  },
];

const Subscription = () => {
  const { isSubscribed, subscriptionEnd, cancelAtPeriodEnd, checkSubscription, subscriptionTier, subscriptionStatus } = useAuth();
  const [isLoading, setIsLoading] = useState<PlanType | null>(null);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [canceledDate, setCanceledDate] = useState<string>('');
  const { trackEvent, trackPageView } = useTracking();
  const hasTrackedPageView = useRef(false);

  // Track page view (only once, even with React Strict Mode)
  useEffect(() => {
    if (!hasTrackedPageView.current) {
      trackPageView('subscription_page');
      trackEvent('pricing_viewed');
      hasTrackedPageView.current = true;
    }
  }, [trackPageView, trackEvent]);

  // Calcular dias restantes do trial ou assinatura
  const calculateDaysRemaining = (endDate: string | null): number => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = calculateDaysRemaining(subscriptionEnd);
  const isTrialing = subscriptionStatus === 'trialing';

  // Mapa de tiers para facilitar comparação
  const tierOrder: Record<string, number> = {
    'free': 0,
    'basic': 1,
    'pro': 2,
    'agency': 3,
  };

  const handleSubscribe = async (priceId: string, planId: PlanType) => {
    setIsLoading(planId);

    // Get plan details
    const selectedPlan = plans.find(p => p.id === planId);
    const planPrice = parseInt(selectedPlan?.price.replace(/\D/g, '') || '0');

    // Track plan selection
    trackEvent('plan_selected', {
      plan_tier: planId,
      plan_price: planPrice,
      is_trial: false,
    });

    try {
      // Mostrar toast ANTES de chamar a função
      toast.loading('Criando checkout...', { id: 'checkout' });

      // Timeout de 15 segundos
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout: A requisição demorou muito')), 15000)
      );

      const invokePromise = supabase.functions.invoke('create-checkout', {
        body: { priceId }
      });

      const { data, error } = await Promise.race([invokePromise, timeoutPromise]) as any;

      if (error) throw error;

      if (data?.url) {
        // Track checkout start
        trackEvent('checkout_started', {
          plan_tier: planId,
          plan_price: planPrice,
        });

        toast.success('Redirecionando...', { id: 'checkout' });

        // Redirect imediatamente
        window.location.href = data.url;
      } else {
        toast.error('Erro: Nenhuma URL de checkout retornada', { id: 'checkout' });
        setIsLoading(null);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Erro ao iniciar checkout. Tente novamente.', { id: 'checkout' });
      setIsLoading(null);
    }
  };

  const handleManagePayment = async () => {
    setIsPortalLoading(true);

    try {
      toast.loading('Abrindo portal...', { id: 'portal' });

      // Timeout de 15 segundos
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout: A requisição demorou muito')), 15000)
      );

      const invokePromise = supabase.functions.invoke('customer-portal');
      const { data, error } = await Promise.race([invokePromise, timeoutPromise]) as any;

      if (error) throw error;

      if (data?.url) {
        toast.success('Redirecionando...', { id: 'portal' });
        window.location.href = data.url;
      } else {
        toast.error('Erro: Nenhuma URL do portal retornada', { id: 'portal' });
        setIsPortalLoading(false);
      }
    } catch (error: any) {
      console.error('Portal error:', error);
      toast.error(error.message || 'Erro ao abrir portal. Tente novamente.', { id: 'portal' });
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

  // Função para determinar o texto do botão baseado no plano atual
  const getButtonText = (planId: PlanType): string => {
    // Se não está inscrito e é o plano Basic, mostrar trial
    if (!isSubscribed && planId === 'basic') {
      return 'Testar Grátis';
    }

    if (!isSubscribed) return 'Assinar Agora';

    const currentTier = subscriptionTier || 'free';
    const currentOrder = tierOrder[currentTier] || 0;
    const targetOrder = tierOrder[planId] || 0;

    if (currentTier === planId) return 'Plano Atual';
    if (targetOrder > currentOrder) return 'Fazer Upgrade';
    if (targetOrder < currentOrder) return 'Fazer Downgrade';
    return 'Trocar Plano';
  };

  // Função para verificar se é o plano atual
  const isCurrentPlan = (planId: PlanType): boolean => {
    return isSubscribed && subscriptionTier === planId;
  };

  // Reorganizar planos: no desktop coloca Basic no centro, no mobile por ordem de preço
  const desktopOrder = [plans[1], plans[0], plans[2]]; // Pro, Basic, Agency
  const mobileOrder = [...plans]; // Basic, Pro, Agency (ordem original por preço)

  return (
    <div className="min-h-screen w-full bg-black flex flex-col p-6 pb-32">
      {/* Logo fixa no header */}
      <div className="w-full flex justify-center pt-2 pb-8 md:pb-4">
        <Logo className="h-16 w-auto" />
      </div>

      <div className="w-full max-w-7xl mx-auto space-y-8">
        {/* Card de assinatura ativa */}
        {isSubscribed && (
          <LiquidGlass>
            <Card className="bg-transparent border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Crown className="w-5 h-5 text-[#46CCC6]" />
                      Plano {subscriptionTier && plans.find(p => p.id === subscriptionTier)?.name}
                    </CardTitle>
                    <CardDescription className="text-white/60">
                      Você tem acesso aos recursos do seu plano
                    </CardDescription>
                  </div>
                  <Badge className="bg-[#46CCC6] text-black">
                    Ativo
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Card de Trial Ativo */}
                  {isTrialing && subscriptionEnd && (
                    <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <Clock className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-yellow-500 font-semibold">
                            🎁 Trial Gratuito Ativo
                          </p>
                          <p className="text-sm text-white/80 mt-1">
                            {daysRemaining > 0 ? (
                              <>
                                Você tem <span className="font-bold text-yellow-400">{daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}</span> restantes de trial grátis!
                              </>
                            ) : (
                              'Seu trial termina hoje!'
                            )}
                          </p>
                          <p className="text-xs text-white/60 mt-2">
                            Seu cartão será cobrado em <span className="font-semibold text-white/80">{new Date(subscriptionEnd).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Card de Cancelamento Agendado */}
                  {cancelAtPeriodEnd && subscriptionEnd && !isTrialing && (
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
                  {subscriptionEnd && !cancelAtPeriodEnd && !isTrialing && (
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
                              {isTrialing ? (
                                <>
                                  Você está em trial gratuito. Se cancelar agora, você continuará tendo acesso até o final do trial ({new Date(subscriptionEnd!).toLocaleDateString('pt-BR')}) e <span className="font-semibold text-white">não será cobrado</span>.
                                </>
                              ) : (
                                <>
                                  Sua assinatura permanecerá ativa até o final do período de cobrança atual.
                                  Você perderá acesso aos recursos do plano após essa data.
                                </>
                              )}
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

        {/* Título da seção de planos */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
            Escolha seu <span className="text-[#46CCC6]">plano ideal</span>
          </h2>
          <p className="text-white/60 text-lg">
            Transforme seus dados do Meta Ads em insights acionáveis
          </p>
        </div>

        {/* Grid de planos - Desktop (3 colunas com Basic no centro) */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {desktopOrder.map((plan) => (
            <div key={plan.id} className="relative">
              {plan.popular && !isCurrentPlan(plan.id) && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                  <Badge className="bg-gradient-to-r from-[#46CCC6] to-[#2D9B96] text-black px-4 py-1 text-xs font-bold">
                    MAIS POPULAR
                  </Badge>
                </div>
              )}
              {isCurrentPlan(plan.id) && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1 text-xs font-bold">
                    SEU PLANO ATUAL
                  </Badge>
                </div>
              )}

              <LiquidGlass
                className={`h-full flex flex-col ${
                  plan.popular ? 'border-2 border-[#46CCC6]/50 scale-105 shadow-2xl shadow-[#46CCC6]/20' : ''
                }`}
              >
                <Card className="bg-transparent border-0 h-full flex flex-col">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                      plan.popular
                        ? 'bg-gradient-to-br from-[#46CCC6] to-[#2D9B96]'
                        : 'bg-white/10'
                    }`}>
                      <plan.icon className={`w-6 h-6 ${plan.popular ? 'text-black' : 'text-[#46CCC6]'}`} />
                    </div>
                    <CardTitle className="text-2xl text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="text-white/60">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 space-y-6">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                          {!isSubscribed && plan.id === 'basic' ? 'R$ 0' : plan.price}
                        </span>
                        <span className="text-white/60">/mês</span>
                      </div>
                      {!isSubscribed && plan.id === 'basic' && (
                        <p className="text-xs text-white/50 mt-1">após R$47/mês</p>
                      )}
                      <p className="text-sm text-[#46CCC6] mt-1">{plan.requestLimit}</p>
                    </div>

                    <div className="space-y-3 flex-1">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#46CCC6]/20 flex items-center justify-center mt-0.5">
                            <Check className="w-3 h-3 text-[#46CCC6]" />
                          </div>
                          <span className="text-white/80 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      size="lg"
                      className={`w-full font-semibold text-lg ${
                        isCurrentPlan(plan.id)
                          ? 'bg-white/10 text-white/60 cursor-not-allowed'
                          : plan.popular
                          ? 'bg-gradient-to-r from-[#46CCC6] to-[#2D9B96] hover:opacity-90 text-black'
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                      }`}
                      onClick={() => handleSubscribe(plan.priceId, plan.id)}
                      disabled={isLoading === plan.id || isCurrentPlan(plan.id)}
                    >
                      {isLoading === plan.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {getButtonText(plan.id)}
                    </Button>
                  </CardContent>
                </Card>
              </LiquidGlass>
            </div>
          ))}
        </div>

        {/* Grid de planos - Mobile (ordem por preço) */}
        <div className="md:hidden space-y-6">
          {mobileOrder.map((plan) => (
            <div key={plan.id} className="relative">
              {plan.popular && !isCurrentPlan(plan.id) && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                  <Badge className="bg-gradient-to-r from-[#46CCC6] to-[#2D9B96] text-black px-4 py-1 text-xs font-bold">
                    MAIS POPULAR
                  </Badge>
                </div>
              )}
              {isCurrentPlan(plan.id) && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1 text-xs font-bold">
                    SEU PLANO ATUAL
                  </Badge>
                </div>
              )}

              <LiquidGlass
                className={plan.popular ? 'border-2 border-[#46CCC6]/50 shadow-xl shadow-[#46CCC6]/20' : ''}
              >
                <Card className="bg-transparent border-0">
                  <CardHeader className="text-center">
                    <div className="flex flex-col items-center mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                        plan.popular
                          ? 'bg-gradient-to-br from-[#46CCC6] to-[#2D9B96]'
                          : 'bg-white/10'
                      }`}>
                        <plan.icon className={`w-6 h-6 ${plan.popular ? 'text-black' : 'text-[#46CCC6]'}`} />
                      </div>
                      <CardTitle className="text-xl text-white mb-1" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                        {plan.name}
                      </CardTitle>
                      <CardDescription className="text-white/60">
                        {plan.description}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-white" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                          {!isSubscribed && plan.id === 'basic' ? 'R$ 0' : plan.price}
                        </span>
                        <span className="text-white/60 text-sm">/mês</span>
                      </div>
                      <p className="text-sm text-[#46CCC6] mt-1">{plan.requestLimit}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2 justify-center">
                          <div className="flex-shrink-0 w-4 h-4 rounded-full bg-[#46CCC6]/20 flex items-center justify-center mt-0.5">
                            <Check className="w-2.5 h-2.5 text-[#46CCC6]" />
                          </div>
                          <span className="text-white/80 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      size="lg"
                      className={`w-full font-semibold text-lg ${
                        isCurrentPlan(plan.id)
                          ? 'bg-white/10 text-white/60 cursor-not-allowed'
                          : plan.popular
                          ? 'bg-gradient-to-r from-[#46CCC6] to-[#2D9B96] hover:opacity-90 text-black'
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                      }`}
                      onClick={() => handleSubscribe(plan.priceId, plan.id)}
                      disabled={isLoading === plan.id || isCurrentPlan(plan.id)}
                    >
                      {isLoading === plan.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {getButtonText(plan.id)}
                    </Button>
                    {!isSubscribed && plan.id === 'basic' && (
                      <p className="text-xs text-white/50 text-center mt-2">Após, R$47/mês</p>
                    )}
                  </CardContent>
                </Card>
              </LiquidGlass>
            </div>
          ))}
        </div>
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
