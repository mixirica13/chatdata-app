import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFacebookLogin } from '@/hooks/useFacebookLogin';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { CheckCircle2, ArrowLeft, AlertCircle, Facebook } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTracking } from '@/hooks/useTracking';

const ConnectMeta = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const hasProcessedToken = useRef(false);
  const { user, refreshProfile, onboardingStep, updateOnboardingStep } = useAuth();
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
      // Skip if no auth response, no user, already saving, or already processed this token
      if (!authResponse || !user) return;
      if (hasProcessedToken.current) return;

      // Mark as processing to prevent duplicate calls
      hasProcessedToken.current = true;
      setIsSaving(true);
      setConnectionError(null);

      // Safety timeout: if saving takes more than 30 seconds, show error
      const safetyTimeout = setTimeout(() => {
        console.error('Connection timeout - operation took too long');
        setConnectionError('A conexão demorou muito. Por favor, tente novamente.');
        setIsSaving(false);
        hasProcessedToken.current = false;
      }, 30000);

      try {
        console.log('Exchanging Facebook token for long-lived token...');

        // Exchange short-lived token for long-lived token via Edge Function
        const { data, error: exchangeError } = await supabase.functions.invoke('exchange-facebook-token', {
          body: {
            short_lived_token: authResponse.accessToken,
            ad_account_ids: [],
            granted_permissions: authResponse.grantedScopes?.split(',') || [],
          },
        });

        if (exchangeError) {
          clearTimeout(safetyTimeout);
          console.error('Token exchange error:', exchangeError);
          hasProcessedToken.current = false; // Allow retry

          // Track connection failure
          trackEvent('meta_connection_failed', {
            error_type: exchangeError.message || 'token_exchange_error',
          });

          setConnectionError(exchangeError.message || 'Erro ao trocar token');
          toast.error('Erro ao salvar conexão. Tente novamente.');
          setIsSaving(false);
          return;
        }

        clearTimeout(safetyTimeout);

        // Track successful connection
        const permissions = authResponse.grantedScopes?.split(',') || [];
        trackEvent('meta_connection_completed', {
          ad_accounts_count: 0,
          permissions_granted: permissions,
        });

        toast.success('Meta Ads conectado com sucesso!');

        // Navigate immediately using window.location for iOS Safari compatibility
        window.location.href = '/dashboard';

        // Fire-and-forget: refresh profile in background (don't await)
        Promise.resolve().then(async () => {
          try {
            await refreshProfile();
            if (onboardingStep === 1) {
              await updateOnboardingStep(2);
            }
          } catch (e) {
            console.error('Background profile refresh error:', e);
          }
        });
      } catch (error) {
        clearTimeout(safetyTimeout);
        console.error('Error saving connection:', error);
        hasProcessedToken.current = false; // Allow retry

        // Track connection failure
        trackEvent('meta_connection_failed', {
          error_type: 'unexpected_error',
        });

        setConnectionError('Erro inesperado ao salvar conexão');
        toast.error('Erro ao salvar conexão. Tente novamente.');
        setIsSaving(false);
      }
    };

    saveConnection();
  }, [authResponse, user, trackEvent, refreshProfile, onboardingStep, updateOnboardingStep]);

  const handleConnect = async () => {
    try {
      // Reset state for new connection attempt
      hasProcessedToken.current = false;
      setConnectionError(null);

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
      <div className="max-w-2xl mx-auto">
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
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/2023_Facebook_icon.svg/128px-2023_Facebook_icon.svg.png"
                alt="Facebook"
                className="w-20 h-20"
              />
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

            {!isConnected || connectionError ? (
              <>
                {connectionError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {connectionError}. Clique em "Conectar com Meta" para tentar novamente.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <p className="font-medium">Permissões necessárias:</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      Gerenciar e ler campanhas e anúncios
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      Acessar métricas de performance (impressões, cliques, conversões)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      Ver informações de públicos e segmentações
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      Acessar relatórios de orçamento e gastos
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      Gerenciar Business Manager
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Segurança:</strong> Seus dados são criptografados e nunca serão compartilhados com terceiros. Você pode revogar o acesso a qualquer momento.
                  </p>
                </div>

                <div data-onboarding-target="meta-button">
                  <Button
                    onClick={handleConnect}
                    disabled={isLoading || !isInitialized || isSaving}
                    className="w-full bg-[#46CCC6] hover:bg-[#46CCC6]/90 text-black font-semibold"
                    size="lg"
                  >
                    {isLoading || isSaving ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Facebook className="w-5 h-5 mr-2" />
                        {connectionError ? 'Tentar Novamente' : 'Conectar com Facebook'}
                      </>
                    )}
                  </Button>
                </div>
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
