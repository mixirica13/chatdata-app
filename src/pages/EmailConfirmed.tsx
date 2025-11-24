import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Zap } from 'lucide-react';

const EmailConfirmed = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-500/10 p-4 rounded-full">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Email confirmado!</CardTitle>
          <CardDescription>
            Sua conta foi ativada com sucesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
            <p className="text-sm text-green-900 dark:text-green-100 text-center">
              Parabéns! Agora você pode fazer login e começar a usar o ChatData.
            </p>
          </div>

          <div className="space-y-3 bg-accent/50 p-4 rounded-lg">
            <p className="font-medium text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Próximos passos:
            </p>
            <ol className="space-y-2 text-sm text-muted-foreground ml-6">
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">1.</span>
                <span>Faça login com suas credenciais</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">2.</span>
                <span>Conecte sua conta do Meta Ads</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">3.</span>
                <span>Comece a receber insights inteligentes</span>
              </li>
            </ol>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => navigate('/login')}
              className="w-full"
              size="lg"
            >
              Ir para Login
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Redirecionando automaticamente em {countdown} segundo{countdown !== 1 ? 's' : ''}...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfirmed;
