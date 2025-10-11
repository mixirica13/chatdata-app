import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LiquidGlass } from '@/components/LiquidGlass';
import { BottomNav } from '@/components/BottomNav';
import { Logo } from '@/components/Logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Subscription = () => {
  const { isSubscribed, subscriptionEnd, checkSubscription } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

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

  const handleCheckStatus = async () => {
    setIsChecking(true);
    try {
      await checkSubscription();
      toast.success('Status atualizado!');
    } catch (error) {
      toast.error('Erro ao verificar status');
    } finally {
      setIsChecking(false);
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
                  {subscriptionEnd && (
                    <p className="text-sm text-white/60">
                      Renovação em: {new Date(subscriptionEnd).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                  <Button
                    variant="outline"
                    onClick={handleCheckStatus}
                    disabled={isChecking}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    {isChecking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Atualizar Status
                  </Button>
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

      <BottomNav />
    </div>
  );
};

export default Subscription;
