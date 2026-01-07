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

type PlanType = 'basic' | 'pro' | 'agency' | 'mcp';

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
  visible?: boolean;
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    icon: Zap,
    price: 'R$ 47',
    priceId: 'price_1SWm28A76CJavEvOTQu7kLC1',
    description: 'Ideal to get started with AI',
    features: [
      'Access to ChatData AI on WhatsApp',
      'Customizable dashboard',
      'Burn-up chart for tracking',
      'Detailed spending control',
      'Balance alert for prepaid accounts',
      '50 requests/day',
    ],
    popular: false,
    requestLimit: '50 requests/day',
    visible: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: TrendingUp,
    price: 'R$ 97',
    priceId: 'price_1SWlyAA76CJavEvOEXapiskH',
    description: 'For professionals seeking more',
    features: [
      'Access to ChatData AI on WhatsApp',
      'Customizable dashboard',
      'Burn-up chart for tracking',
      'Detailed spending control',
      'Balance alert for prepaid accounts',
      '100 requests/day',
    ],
    popular: false,
    requestLimit: '100 requests/day',
    visible: false,
  },
  {
    id: 'agency',
    name: 'Agency',
    icon: Rocket,
    price: 'R$ 197',
    priceId: 'price_1SWlxaA76CJavEvOS0FdYuNb',
    description: 'Complete solution for agencies',
    features: [
      'All Pro features',
      'Advanced customizable dashboard',
      'Detailed burn-up chart',
      'Complete spending control',
      'Custom alerts',
      'Unlimited requests',
    ],
    popular: false,
    requestLimit: 'Unlimited requests',
    visible: false,
  },
  {
    id: 'mcp',
    name: 'Chatdata MCP',
    icon: BarChart3,
    price: '$10',
    priceId: 'price_1ShLvVA76CJavEvOTW5qeasM',
    description: 'MCP integration with Claude, ChatGPT and other LLMs',
    features: [
      'Access to remote MCP server',
      'Integration with Claude Desktop',
      'Integration with Claude.ai',
      'Integration with ChatGPT',
      'Meta Ads queries via AI',
      'Real-time campaign insights',
      'Customizable dashboard',
      'Unlimited requests',
    ],
    popular: true,
    requestLimit: 'Unlimited requests',
    visible: true,
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
    'mcp': 4,
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
      toast.loading('Creating checkout...', { id: 'checkout' });

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

        toast.success('Redirecting...', { id: 'checkout' });

        // Redirect imediatamente
        window.location.href = data.url;
      } else {
        toast.error('Error: No checkout URL returned', { id: 'checkout' });
        setIsLoading(null);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Error starting checkout. Please try again.', { id: 'checkout' });
      setIsLoading(null);
    }
  };

  const handleManagePayment = async () => {
    setIsPortalLoading(true);

    try {
      toast.loading('Opening portal...', { id: 'portal' });

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
        toast.error('Error: No portal URL returned', { id: 'portal' });
        setIsPortalLoading(false);
      }
    } catch (error: any) {
      console.error('Portal error:', error);
      toast.error(error.message || 'Error opening portal. Please try again.', { id: 'portal' });
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
        toast.error('Error canceling subscription');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error canceling subscription');
    } finally {
      setIsCanceling(false);
    }
  };

  // Função para determinar o texto do botão baseado no plano atual
  const getButtonText = (planId: PlanType): string => {
    // Se não está inscrito e é o plano Basic, mostrar trial
    if (!isSubscribed && planId === 'basic') {
      return 'Try Free';
    }

    if (!isSubscribed) return 'Subscribe Now';

    const currentTier = subscriptionTier || 'free';
    const currentOrder = tierOrder[currentTier] || 0;
    const targetOrder = tierOrder[planId] || 0;

    if (currentTier === planId) return 'Current Plan';
    if (targetOrder > currentOrder) return 'Upgrade';
    if (targetOrder < currentOrder) return 'Downgrade';
    return 'Switch Plan';
  };

  // Função para verificar se é o plano atual
  const isCurrentPlan = (planId: PlanType): boolean => {
    return isSubscribed && subscriptionTier === planId;
  };

  // Filtrar apenas planos visíveis
  const visiblePlans = plans.filter(p => p.visible !== false);
  const desktopOrder = visiblePlans;
  const mobileOrder = visiblePlans;

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
                      You have access to your plan features
                    </CardDescription>
                  </div>
                  <Badge className="bg-[#46CCC6] text-black">
                    Active
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
                            🎁 Free Trial Active
                          </p>
                          <p className="text-sm text-white/80 mt-1">
                            {daysRemaining > 0 ? (
                              <>
                                You have <span className="font-bold text-yellow-400">{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}</span> left of free trial!
                              </>
                            ) : (
                              'Your trial ends today!'
                            )}
                          </p>
                          <p className="text-xs text-white/60 mt-2">
                            Your card will be charged on <span className="font-semibold text-white/80">{new Date(subscriptionEnd).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
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
                        Subscription will be canceled
                      </p>
                      <p className="text-sm text-yellow-500/80 mt-1">
                        You will have access until: {new Date(subscriptionEnd).toLocaleDateString('en-US')}
                      </p>
                    </div>
                  )}
                  {subscriptionEnd && !cancelAtPeriodEnd && !isTrialing && (
                    <p className="text-sm text-white/60">
                      Renews on: {new Date(subscriptionEnd).toLocaleDateString('en-US')}
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
                      Manage Payment
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
                            Cancel Subscription
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-zinc-900 border-white/10">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">
                              Are you sure you want to cancel?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-white/60">
                              {isTrialing ? (
                                <>
                                  You are on a free trial. If you cancel now, you will continue to have access until the end of the trial ({new Date(subscriptionEnd!).toLocaleDateString('en-US')}) and <span className="font-semibold text-white">will not be charged</span>.
                                </>
                              ) : (
                                <>
                                  Your subscription will remain active until the end of the current billing period.
                                  You will lose access to plan features after that date.
                                </>
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-transparent border-white/20 text-white hover:bg-white/10">
                              Keep Subscription
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleCancelSubscription}
                              className="bg-red-600 text-white hover:bg-red-700"
                            >
                              Yes, Cancel
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
            Choose your <span className="text-[#46CCC6]">ideal plan</span>
          </h2>
          <p className="text-white/60 text-lg">
            Transform your Meta Ads data into actionable insights
          </p>
        </div>

        {/* Grid de planos - Desktop */}
        <div className={`hidden md:grid gap-6 ${visiblePlans.length === 1 ? 'md:grid-cols-1 max-w-lg mx-auto' : visiblePlans.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' : 'md:grid-cols-3'}`}>
          {desktopOrder.map((plan) => (
            <div key={plan.id} className="relative">
              {plan.popular && !isCurrentPlan(plan.id) && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                  <Badge className="bg-gradient-to-r from-[#46CCC6] to-[#2D9B96] text-black px-4 py-1 text-xs font-bold">
                    MOST POPULAR
                  </Badge>
                </div>
              )}
              {isCurrentPlan(plan.id) && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1 text-xs font-bold">
                    YOUR CURRENT PLAN
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
                        <p className="text-xs text-white/50 mt-1">then R$47/month</p>
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
                    MOST POPULAR
                  </Badge>
                </div>
              )}
              {isCurrentPlan(plan.id) && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1 text-xs font-bold">
                    YOUR CURRENT PLAN
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
                        <div key={idx} className="flex items-start gap-2">
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
                      <p className="text-xs text-white/50 text-center mt-2">Then, R$47/month</p>
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
                Subscription Canceled
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-white/80 text-center space-y-4">
              <p className="text-lg">
                Your subscription has been successfully canceled.
              </p>
              <div className="bg-[#46CCC6]/10 border border-[#46CCC6]/20 rounded-lg p-4">
                <p className="text-sm text-white/60 mb-2">
                  You will continue with premium access until:
                </p>
                <p className="text-xl font-semibold text-[#46CCC6]">
                  {canceledDate}
                </p>
              </div>
              <p className="text-sm text-white/60">
                After that date, you will lose access to premium features.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-col gap-2">
            <AlertDialogAction
              onClick={() => window.location.reload()}
              className="w-full bg-[#46CCC6] text-black hover:bg-[#46CCC6]/90 font-semibold"
            >
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  );
};

export default Subscription;
