import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFacebookLogin } from '@/hooks/useFacebookLogin';
import { createMetaGraphAPI } from '@/lib/metaGraphAPI';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Facebook, CheckCircle2, ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ConnectMeta = () => {
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const { user } = useAuth();
  const { isInitialized, isLoading, authResponse, login } = useFacebookLogin();
  const navigate = useNavigate();

  const isConnected = !!authResponse;

  // Load ad accounts and auto-save when user connects
  useEffect(() => {
    const loadAndSaveAccounts = async () => {
      if (!authResponse || !user) return;

      setIsLoadingAccounts(true);
      try {
        const api = createMetaGraphAPI(authResponse.accessToken);
        const accounts = await api.getAdAccounts();

        if (accounts.length === 0) {
          toast.error('Nenhuma conta de anúncios encontrada. Verifique suas permissões.');
          setIsLoadingAccounts(false);
          return;
        }

        // Auto-save all accounts
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + authResponse.expiresIn);

        // Save connection data to Supabase
        const { error: functionError } = await supabase.functions.invoke('store-meta-token', {
          body: {
            access_token: authResponse.accessToken,
            user_id: authResponse.userID,
            expires_at: expiresAt.toISOString(),
            granted_scopes: authResponse.grantedScopes?.split(',') || [],
            ad_accounts: accounts,
          },
        });

        if (functionError) {
          console.error('Edge function error:', functionError);
        }

        // Update profile to mark as connected
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ meta_connected: true })
          .eq('user_id', user.id);

        if (profileError) throw profileError;

        toast.success(`Meta Ads conectado com sucesso! ${accounts.length} conta(s) de anúncios vinculada(s).`);
        navigate('/dashboard');
      } catch (error) {
        console.error('Error loading ad accounts:', error);
        toast.error('Erro ao salvar conexão. Tente novamente.');
      } finally {
        setIsLoadingAccounts(false);
      }
    };

    loadAndSaveAccounts();
  }, [authResponse, user, navigate]);

  const handleConnect = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Connection error:', error);
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

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <p className="text-sm text-yellow-900">
                    <strong>Modo de Teste:</strong> Este app está em modo de desenvolvimento. Apenas usuários autorizados como testadores no Meta App podem fazer login.
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
              <>
                <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 p-4 rounded-lg">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">Conexão estabelecida com sucesso!</span>
                </div>

                {isLoadingAccounts && (
                  <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <LoadingSpinner size="lg" />
                    <p className="text-muted-foreground">Salvando suas contas de anúncios...</p>
                    <p className="text-sm text-muted-foreground">Você será redirecionado automaticamente</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConnectMeta;
