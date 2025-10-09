import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Facebook, CheckCircle2, ArrowLeft } from 'lucide-react';
import { mockAdAccounts } from '@/lib/mockData';
import { toast } from 'sonner';

const ConnectMeta = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const { connectMeta } = useAuthStore();
  const navigate = useNavigate();

  const handleConnect = async () => {
    setIsConnecting(true);
    // Simulate OAuth redirect and connection
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsConnected(true);
    setIsConnecting(false);
  };

  const handleConfirm = () => {
    if (selectedAccounts.length === 0) {
      toast.error('Selecione pelo menos uma conta de anúncios');
      return;
    }
    connectMeta();
    toast.success('Meta Ads conectado com sucesso!');
    navigate('/dashboard');
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
            {!isConnected ? (
              <>
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <p className="font-medium">Permissões necessárias:</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Ler dados de campanhas e anúncios
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
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Segurança:</strong> Seus dados são criptografados e nunca serão compartilhados com terceiros. Você pode revogar o acesso a qualquer momento.
                  </p>
                </div>

                <Button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="w-full"
                  size="lg"
                >
                  {isConnecting ? (
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

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-3">Selecione as contas de anúncios:</h3>
                    <div className="space-y-3">
                      {mockAdAccounts.map((account) => (
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
                              ID: {account.id} • {account.currency}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleConfirm}
                    className="w-full"
                    size="lg"
                    disabled={selectedAccounts.length === 0}
                  >
                    Confirmar e Continuar
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConnectMeta;
