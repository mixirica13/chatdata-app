import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFacebookLogin } from '@/hooks/useFacebookLogin';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Facebook, CheckCircle2, ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTracking } from '@/hooks/useTracking';

const ConnectMeta = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { user, checkSubscription } = useAuth();
  const { isInitialized, isLoading, authResponse, login } = useFacebookLogin();
  const navigate = useNavigate();
  const { trackEvent, trackPageView } = useTracking();

  const isConnected = !!authResponse;

  // Track page view
  useEffect(() => {
    trackPageView('connect_meta_page');
  }, [trackPageView]);

  // Automatically save token when user connects with Facebook
  useEffect(() => {
    const saveConnection = async () => {
      if (!authResponse || !user || isSaving) return;

      setIsSaving(true);
      try {
        console.log('Exchanging Facebook token for long-lived token...');

        // Exchange short-lived token for long-lived token via Edge Function
        const { data, error: exchangeError } = await supabase.functions.invoke('exchange-facebook-token', {
          body: {
            short_lived_token: authResponse.accessToken,
            ad_account_ids: [], // Empty array - user will select accounts later
            granted_permissions: authResponse.grantedScopes?.split(',') || [],
          },
        });

        if (exchangeError) {
          console.error('Token exchange error:', exchangeError);

          // Track connection failure
          trackEvent('meta_connection_failed', {
            error_type: exchangeError.message || 'token_exchange_error',
          });

          toast.error('Erro ao salvar conexão. Tente novamente.');
          return;
        }

        console.log('Token exchanged successfully:', data);

        // Refresh user profile to update metaConnected flag
        await checkSubscription();

        // Track successful connection
        const permissions = authResponse.grantedScopes?.split(',') || [];
        trackEvent('meta_connection_completed', {
          ad_accounts_count: 0, // Will be updated when user selects accounts
          permissions_granted: permissions,
        });

        toast.success('Meta Ads conectado com sucesso!');

        // Navigate to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } catch (error) {
        console.error('Error saving connection:', error);

        // Track connection failure
        trackEvent('meta_connection_failed', {
          error_type: 'unexpected_error',
        });

        toast.error('Erro ao salvar conexão. Tente novamente.');
      } finally {
        setIsSaving(false);
      }
    };

    saveConnection();
  }, [authResponse, user, trackEvent]);

  const handleConnect = async () => {
    try {
      // Track connection start
      trackEvent('meta_connection_started');

      await login();
    } catch (error) {
      console.error('Connection error:', error);

      // Track connection failure
      trackEvent('meta_connection_failed', {
        error_type: 'login_error',
      });

      toast.error('Erro ao conectar com Meta');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-500 p-4 rounded-2xl">
                <Facebook className="w-12 h-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Conectar Meta Ads</CardTitle>
            <CardDescription>
              Conecte suas contas de anúncios para começar a receber insights
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isInitialized && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Carregando Facebook SDK...
                </AlertDescription>
              </Alert>
            )}

            {!isConnected ? (
              <>
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <p className="font-medium">Permissões necessárias:</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Gerenciar e ler campanhas e anúncios
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Acessar métricas de performance (impressões, cliques, conversões)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Ver informações de públicos e segmentações
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Acessar relatórios de orçamento e gastos
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Gerenciar Business Manager
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Segurança:</strong> Seus dados são criptografados e nunca serão compartilhados com terceiros. Você pode revogar o acesso a qualquer momento.
                  </p>
                </div>

                <Button
                  onClick={handleConnect}
                  disabled={isLoading || !isInitialized}
                  className="w-full bg-[#46CCC6] hover:bg-[#46CCC6]/90 text-black font-semibold"
                  size="lg"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Facebook className="w-5 h-5 mr-2" />
                      Conectar com Meta
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 p-4 rounded-lg">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">Conectando sua conta...</span>
                </div>

                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                  <p className="ml-3 text-muted-foreground">Salvando credenciais e configurando acesso...</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConnectMeta;
