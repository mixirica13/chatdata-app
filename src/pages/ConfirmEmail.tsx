import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, CheckCircle2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const ConfirmEmail = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();

  const handleResendEmail = async () => {
    if (!email) {
      toast.error('Email não encontrado. Por favor, faça o cadastro novamente.');
      navigate('/register');
      return;
    }

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/email-confirmed`,
        },
      });

      if (error) throw error;

      toast.success('Email de confirmação reenviado! Verifique sua caixa de entrada.');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao reenviar email. Tente novamente.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <Mail className="w-12 h-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Confirme seu email</CardTitle>
          <CardDescription>
            Enviamos um link de confirmação para seu email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">Email enviado para:</p>
            <p className="text-sm text-muted-foreground break-all">{email}</p>
          </div>

          <div className="space-y-3 bg-accent/50 p-4 rounded-lg">
            <p className="font-medium text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Próximos passos:
            </p>
            <ol className="space-y-2 text-sm text-muted-foreground ml-6">
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">1.</span>
                <span>Abra seu email e procure por uma mensagem do Meta Aura</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">2.</span>
                <span>Clique no link de confirmação</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">3.</span>
                <span>Você será redirecionado para fazer login</span>
              </li>
            </ol>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleResendEmail}
              disabled={isResending || !email}
              variant="outline"
              className="w-full"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Reenviando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reenviar email
                </>
              )}
            </Button>

            <Button
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Ir para Login
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Não recebeu o email? Verifique sua pasta de spam ou lixo eletrônico.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmEmail;
