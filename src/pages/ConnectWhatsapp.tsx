import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MessageCircle, CheckCircle2, ArrowLeft, Phone } from 'lucide-react';
import { toast } from 'sonner';

const ConnectWhatsapp = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Simulate scanning QR code
  const simulateConnection = async () => {
    setIsConnecting(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsConnected(true);
    setIsConnecting(false);
    connectWhatsapp();
  };

  const handleTestConnection = () => {
    toast.success('Mensagem de teste enviada! Verifique seu WhatsApp.');
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
              <div className="bg-green-500 p-4 rounded-2xl">
                <MessageCircle className="w-12 h-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Configurar WhatsApp</CardTitle>
            <CardDescription>
              Conecte seu WhatsApp para receber insights em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isConnected ? (
              <>
                <div className="bg-muted p-6 rounded-lg flex flex-col items-center">
                  <div className="w-64 h-64 bg-white rounded-lg flex items-center justify-center mb-4 border-2 border-dashed relative">
                    {isConnecting ? (
                      <div className="text-center">
                        <LoadingSpinner size="lg" />
                        <p className="text-sm text-muted-foreground mt-4">
                          Aguardando conexão...
                        </p>
                      </div>
                    ) : (
                      <div className="text-center p-4">
                        <div className="text-8xl mb-2">📱</div>
                        <p className="text-xs text-muted-foreground">
                          QR Code para escanear
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 bg-accent/50 p-4 rounded-lg">
                  <p className="font-medium text-sm">Instruções:</p>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <span className="font-semibold text-foreground">1.</span>
                      <span>Abra o WhatsApp no seu celular</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold text-foreground">2.</span>
                      <span>Toque em <strong>Menu</strong> ou <strong>Configurações</strong></span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold text-foreground">3.</span>
                      <span>Toque em <strong>Dispositivos conectados</strong></span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold text-foreground">4.</span>
                      <span>Toque em <strong>Conectar dispositivo</strong></span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold text-foreground">5.</span>
                      <span>Aponte o celular para escanear o QR Code acima</span>
                    </li>
                  </ol>
                </div>

                <Button
                  onClick={simulateConnection}
                  disabled={isConnecting}
                  className="w-full"
                  size="lg"
                >
                  {isConnecting ? 'Conectando...' : 'Simular Conexão'}
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 p-4 rounded-lg">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">WhatsApp conectado com sucesso!</span>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 p-2 rounded-full">
                      <Phone className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Número conectado</p>
                      <p className="text-sm text-muted-foreground">+55 11 99999-9999</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleTestConnection}
                    variant="outline"
                    className="w-full"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Testar Conexão
                  </Button>
                  <Button
                    onClick={() => navigate('/dashboard')}
                    className="w-full"
                    size="lg"
                  >
                    Voltar ao Dashboard
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Você começará a receber insights assim que suas campanhas forem analisadas
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConnectWhatsapp;
