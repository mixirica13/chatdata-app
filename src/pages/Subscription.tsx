import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
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
        window.open(data.url, '_blank');
        toast.success('Redirecionando para o checkout...');
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
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Assinatura</h1>
              <p className="text-muted-foreground mt-1">
                Gerencie sua assinatura e acesse recursos premium
              </p>
            </div>

            {isSubscribed && (
              <Card className="border-green-500/50 bg-green-500/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Crown className="w-5 h-5 text-green-600" />
                        Plano Ativo
                      </CardTitle>
                      <CardDescription>
                        Você tem acesso a todos os recursos premium
                      </CardDescription>
                    </div>
                    <Badge variant="default" className="bg-green-600">
                      Ativo
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subscriptionEnd && (
                      <p className="text-sm text-muted-foreground">
                        Renovação em: {new Date(subscriptionEnd).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                    <Button
                      variant="outline"
                      onClick={handleCheckStatus}
                      disabled={isChecking}
                    >
                      {isChecking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Atualizar Status
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Plano Premium - Meta Ads Insights</CardTitle>
                <CardDescription>
                  Acesso completo à plataforma de insights com IA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-3xl font-bold">
                  R$ 99,00 <span className="text-lg font-normal text-muted-foreground">/mês</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Insights ilimitados via WhatsApp</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Análise de campanhas em tempo real</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Recomendações personalizadas com IA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Relatórios detalhados de performance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Suporte prioritário</span>
                  </div>
                </div>

                {!isSubscribed && (
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleSubscribe}
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Assinar Agora
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Subscription;
