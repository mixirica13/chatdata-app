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
import { useTracking } from '@/hooks/useTracking';
import { translateAuthError } from '@/utils/authErrors';

const loginSchema = z.object({
  email: z.string().email('Email inválido').trim(),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').max(100, 'Senha muito longa'),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [hasLoggedFirstLogin, setHasLoggedFirstLogin] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { login, loginWithGoogle, isAuthenticated, initialize, user } = useAuth();
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
    getValues,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setFormError(null);
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
    } catch (error: any) {
      const translatedError = translateAuthError(error);

      // If email not confirmed, add link to resend
      if (translatedError.includes('confirme seu email')) {
        setFormError(translatedError);
      } else {
        setFormError(translatedError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setFormError(null);
    try {
      await loginWithGoogle();
    } catch (error: any) {
      setFormError(translateAuthError(error));
      setIsGoogleLoading(false);
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
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
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
              {formError && !formError.includes('confirme seu email') && (
                <p className="text-sm text-destructive">{formError}</p>
              )}
              {formError && formError.includes('confirme seu email') && (
                <div className="space-y-1">
                  <p className="text-sm text-destructive">{formError}</p>
                  <button
                    type="button"
                    onClick={() => navigate(`/confirm-email?email=${encodeURIComponent(getValues('email'))}`)}
                    className="text-sm text-primary hover:underline"
                  >
                    Reenviar email de confirmação
                  </button>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full bg-[#46CCC6] hover:bg-[#46CCC6]/90 text-black font-semibold" disabled={isLoading || isGoogleLoading}>
              {isLoading ? <LoadingSpinner size="sm" /> : 'Entrar'}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-white/40">ou continue com</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full bg-white hover:bg-gray-100 text-gray-900 border-white/20 font-medium"
              onClick={handleGoogleLogin}
              disabled={isLoading || isGoogleLoading}
            >
              {isGoogleLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                    <path fill="none" d="M1 1h22v22H1z" />
                  </svg>
                  Continuar com Google
                </>
              )}
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
