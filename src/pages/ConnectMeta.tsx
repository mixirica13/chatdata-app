import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFacebookLogin } from '@/hooks/useFacebookLogin';
import { createMetaGraphAPI } from '@/lib/metaGraphAPI';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Facebook, CheckCircle2, ArrowLeft, AlertCircle } from 'lucide-react';
import { AdAccount } from '@/types/facebook';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ConnectMeta = () => {
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { isInitialized, isLoading, authResponse, login } = useFacebookLogin();
  const navigate = useNavigate();

  const isConnected = !!authResponse;

  // Load ad accounts when user connects
  useEffect(() => {
    const loadAdAccounts = async () => {
      if (!authResponse) return;

      setIsLoadingAccounts(true);
      try {
        const api = createMetaGraphAPI(authResponse.accessToken);
        const accounts = await api.getAdAccounts();
        setAdAccounts(accounts);

        if (accounts.length === 0) {
          toast.info('Nenhuma conta de anúncios encontrada');
        }
      } catch (error) {
        console.error('Error loading ad accounts:', error);
        toast.error('Erro ao carregar contas de anúncios');
      } finally {
        setIsLoadingAccounts(false);
      }
    };

    loadAdAccounts();
  }, [authResponse]);

  const handleConnect = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Erro ao conectar com Meta');
    }
  };

  const handleConfirm = async () => {
    if (selectedAccounts.length === 0) {
      toast.error('Selecione pelo menos uma conta de anúncios');
      return;
    }

    if (!authResponse || !user) {
      toast.error('Erro: Usuário não autenticado');
      return;
    }

    setIsSaving(true);

    try {
      console.log('Exchanging Facebook token for long-lived token...');

      // Extract account IDs from selected accounts
      const accountIds = selectedAccounts.map(id => {
        const account = adAccounts.find(acc => acc.id === id);
        return account?.account_id || id.replace('act_', '');
      });

      // Exchange short-lived token for long-lived token via Edge Function
      const { data, error: exchangeError } = await supabase.functions.invoke('exchange-facebook-token', {
        body: {
          short_lived_token: authResponse.accessToken,
          ad_account_ids: accountIds,
          granted_permissions: authResponse.grantedScopes?.split(',') || [],
        },
      });

      if (exchangeError) {
        console.error('Token exchange error:', exchangeError);
        throw new Error('Falha ao trocar token do Facebook');
      }

      console.log('Token exchanged successfully:', data);

      toast.success('Meta Ads conectado com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error confirming connection:', error);
      toast.error('Erro ao salvar conexão. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAccount = (accountId: string) => {
    setSelectedAccounts((prev) =>
      prev.includes(accountId)
        ? prev.filter((id) => id !== accountId)
        : [...prev, accountId]
    );
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

                {isLoadingAccounts ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="lg" />
                    <p className="ml-3 text-muted-foreground">Carregando contas de anúncios...</p>
                  </div>
                ) : adAccounts.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Nenhuma conta de anúncios encontrada. Certifique-se de ter acesso a pelo menos uma conta de anúncios no Meta Business Manager.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-3">Selecione as contas de anúncios:</h3>
                      <div className="space-y-3">
                        {adAccounts.map((account) => (
                          <div
                            key={account.id}
                            className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent cursor-pointer"
                            onClick={() => toggleAccount(account.id)}
                          >
                            <Checkbox
                              checked={selectedAccounts.includes(account.id)}
                              onCheckedChange={() => toggleAccount(account.id)}
                            />
                            <div className="flex-1">
                              <p className="font-medium">{account.name}</p>
                              <p className="text-sm text-muted-foreground">
                                ID: {account.account_id} • {account.currency}
                              </p>
                              {account.business && (
                                <p className="text-xs text-muted-foreground">
                                  Business: {account.business.name}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={handleConfirm}
                      className="w-full bg-[#46CCC6] hover:bg-[#46CCC6]/90 text-black font-semibold"
                      size="lg"
                      disabled={selectedAccounts.length === 0 || isSaving}
                    >
                      {isSaving ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        'Confirmar e Continuar'
                      )}
                    </Button>
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
