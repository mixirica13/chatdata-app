import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Logo } from '@/components/Logo';
import { toast } from 'sonner';
import { useTracking } from '@/hooks/useTracking';

const loginSchema = z.object({
  email: z.string().email('Email inválido').trim(),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').max(100, 'Senha muito longa'),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoggedFirstLogin, setHasLoggedFirstLogin] = useState(false);
  const { login, isAuthenticated, initialize, user } = useAuth();
  const navigate = useNavigate();
  const { trackEvent, trackPageView, identifyUser } = useTracking();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    trackPageView('login_page');
  }, [trackPageView]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);

      // Track login success - check if it's first login by checking created_at
      if (user && !hasLoggedFirstLogin) {
        const createdAt = new Date(user.created_at);
        const now = new Date();
        const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

        // If account was created within the last minute, it's likely first login
        if (daysSinceCreation < 0.001) {
          trackEvent('first_login');
          setHasLoggedFirstLogin(true);
        }

        // Identify user in PostHog
        if (user.id) {
          identifyUser(user.id);
        }
      }

      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao fazer login. Verifique suas credenciais.';

      // If email not confirmed, show custom message with link
      if (errorMessage.includes('confirme seu email')) {
        toast.error(errorMessage, {
          duration: 6000,
          action: {
            label: 'Reenviar',
            onClick: () => navigate(`/confirm-email?email=${encodeURIComponent(data.email)}`),
          },
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md bg-card border-white/10">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-6">
            <Logo className="h-16 w-auto" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Bem-vindo</CardTitle>
          <CardDescription className="text-white/60">
            Faça login para acessar seus insights de Meta Ads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...register('email')}
                disabled={isLoading}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:bg-black focus:border-primary"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white/80">Senha</Label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Esqueceu sua senha?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                disabled={isLoading}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:bg-black focus:border-primary"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full bg-[#46CCC6] hover:bg-[#46CCC6]/90 text-black font-semibold" disabled={isLoading}>
              {isLoading ? <LoadingSpinner size="sm" /> : 'Entrar'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-sm text-white/60 text-center">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Cadastre-se
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
