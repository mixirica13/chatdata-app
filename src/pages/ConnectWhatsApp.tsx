import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MessageCircle, CheckCircle2, ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useTracking } from '@/hooks/useTracking';

const ConnectWhatsApp = () => {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { trackEvent, trackPageView } = useTracking();

  // Track page view
  useEffect(() => {
    trackPageView('connect_whatsapp_page');
  }, [trackPageView]);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const limited = numbers.slice(0, 11);

    if (limited.length <= 2) {
      return limited;
    } else if (limited.length <= 7) {
      return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
    } else {
      return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const handleSendLink = async () => {
    const cleanPhone = phone.replace(/\D/g, '');

    if (cleanPhone.length < 10) {
      toast.error('Por favor, insira um número de telefone válido.');
      return;
    }

    setIsLoading(true);

    // Track connection start
    trackEvent('whatsapp_connection_started');

    try {
      const fullPhone = `55${cleanPhone}`;

      const response = await fetch('https://webhook.vps.ordershub.com.br/webhook/whatsapp-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: fullPhone,
          userId: user?.id
        }),
      });

      const data = await response.json();

      if (data.success) {
        setLinkSent(true);
        toast.success('Link de autenticação enviado para seu WhatsApp!');

        // Iniciar polling para verificar se o usuário clicou no link
        startVerificationPolling();
      } else {
        // Track failure
        trackEvent('whatsapp_connection_failed', {
          error_type: 'send_link_failed',
        });

        throw new Error(data.message || 'Erro ao enviar link');
      }
    } catch (error) {
      console.error('Erro ao enviar magic link:', error);

      // Track failure
      trackEvent('whatsapp_connection_failed', {
        error_type: 'network_error',
      });

      toast.error('Erro ao enviar link. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const startVerificationPolling = () => {
    setIsVerifying(true);
    const cleanPhone = phone.replace(/\D/g, '');
    const fullPhone = `55${cleanPhone}`;

    // Verificar a cada 3 segundos se o WhatsApp foi conectado
    const interval = setInterval(async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from('subscribers')
        .select('whatsapp_connected')
        .eq('user_id', user.id)
        .single();

      if (profile?.whatsapp_connected) {
        clearInterval(interval);
        setIsVerifying(false);

        // Salvar o número que foi digitado para verificação
        await supabase
          .from('subscribers')
          .update({ whatsapp_phone: fullPhone })
          .eq('user_id', user.id);

        // Track successful connection
        trackEvent('whatsapp_connection_completed', {
          phone_number_hash: `***${cleanPhone.slice(-4)}`,
        });

        toast.success('WhatsApp autenticado com sucesso!');
        navigate('/dashboard');
      }
    }, 3000);

    // Parar polling após 5 minutos
    setTimeout(() => {
      clearInterval(interval);
      setIsVerifying(false);
    }, 5 * 60 * 1000);
  };

  const handleResend = () => {
    setLinkSent(false);
    setIsVerifying(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500/5 via-background to-green-500/10 p-4">
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
            <CardTitle className="text-2xl font-bold">
              {linkSent ? 'Link Enviado!' : 'Autenticar WhatsApp'}
            </CardTitle>
            <CardDescription>
              {linkSent
                ? 'Abra seu WhatsApp e clique no link que enviamos'
                : 'Vincule seu número para usar a IA via WhatsApp'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {!linkSent ? (
              <>
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <p className="font-medium">Por que precisamos autenticar:</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Garantir que é você usando o serviço
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Vincular suas conversas com sua conta
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Proteger seus dados e histórico
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Habilitar recursos personalizados da IA
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Número do WhatsApp</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={handlePhoneChange}
                    disabled={isLoading}
                    className="text-lg"
                    autoComplete="tel"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    Digite seu número com DDD (Brasil)
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4 rounded-lg">
                  <p className="text-sm text-green-900 dark:text-green-100">
                    <strong>Segurança:</strong> Enviaremos um link único que expira em 10 minutos. Você pode revogar o acesso a qualquer momento nas configurações.
                  </p>
                </div>

                <Button
                  onClick={handleSendLink}
                  disabled={isLoading || phone.replace(/\D/g, '').length < 10}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold"
                  size="lg"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Enviar Link de Autenticação
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">Link enviado para {phone}</span>
                </div>

                {isVerifying && (
                  <div className="flex items-center justify-center gap-2 text-blue-600 bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                    <LoadingSpinner size="sm" />
                    <span className="text-sm">Aguardando autenticação...</span>
                  </div>
                )}

                <div className="bg-muted p-4 rounded-lg text-sm space-y-3">
                  <p className="font-medium">Próximos passos:</p>
                  <ol className="space-y-2 list-decimal list-inside text-muted-foreground">
                    <li>Abra seu WhatsApp no celular</li>
                    <li>Você receberá uma mensagem com um link</li>
                    <li>Clique no link para autenticar</li>
                    <li>Volte aqui - você será redirecionado automaticamente</li>
                  </ol>
                </div>

                <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-900 dark:text-amber-100">
                    <strong>Importante:</strong> O link expira em 10 minutos. Se não recebeu, verifique se o número está correto e tente reenviar.
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    onClick={handleResend}
                    disabled={isLoading}
                    className="w-full"
                  >
                    Enviar para outro número
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => navigate('/dashboard')}
                    className="w-full"
                  >
                    Fazer depois
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

export default ConnectWhatsApp;
