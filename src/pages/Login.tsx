import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Logo } from '@/components/Logo';
import { useTracking } from '@/hooks/useTracking';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, ArrowLeft, CheckCircle2, ExternalLink } from 'lucide-react';
import { openEmailProvider, getEmailProviderName } from '@/utils/emailProvider';

const emailSchema = z.object({
  email: z.string().email('Invalid email').trim(),
});

type EmailForm = z.infer<typeof emailSchema>;

const Login = () => {
  const [step, setStep] = useState<'initial' | 'sent'>('initial');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const { loginWithGoogle, isAuthenticated, initialize } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { trackEvent, trackPageView } = useTracking();

  // Get returnUrl from query params (used for MCP OAuth flow)
  const returnUrl = searchParams.get('returnUrl');

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    trackPageView('login_page');
  }, [trackPageView]);

  // Store returnUrl in sessionStorage for use after OAuth callback
  useEffect(() => {
    if (returnUrl) {
      sessionStorage.setItem('auth_return_url', returnUrl);
    }
  }, [returnUrl]);

  useEffect(() => {
    if (isAuthenticated) {
      // Check for stored returnUrl (from MCP OAuth flow)
      const storedReturnUrl = sessionStorage.getItem('auth_return_url');
      if (storedReturnUrl) {
        sessionStorage.removeItem('auth_return_url');
        navigate(storedReturnUrl);
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
  });

  const sendMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
  };

  const onSubmit = async (data: EmailForm) => {
    setIsLoading(true);
    try {
      await sendMagicLink(data.email);
      setSentEmail(data.email);
      setStep('sent');
      trackEvent('magic_link_sent', { email_domain: data.email.split('@')[1] });
    } catch (error: any) {
      console.error('Magic link error:', error);
      toast.error(error.message || 'Error sending link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendLink = async () => {
    if (!sentEmail) return;

    setIsResending(true);
    try {
      await sendMagicLink(sentEmail);
      toast.success('Link resent! Check your inbox.');
      trackEvent('magic_link_resent');
    } catch (error: any) {
      toast.error(error.message || 'Error resending link. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      trackEvent('login_google_started');
      await loginWithGoogle();
    } catch (error: any) {
      toast.error(error.message || 'Error logging in with Google.');
      setIsGoogleLoading(false);
    }
  };

  const handleBack = () => {
    setStep('initial');
    setSentEmail('');
  };

  // Tela de email enviado
  if (step === 'sent') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <Card className="w-full max-w-md bg-card border-white/10">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Mail className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">Check your email</CardTitle>
            <CardDescription className="text-white/60">
              We sent an access link to
            </CardDescription>
            <p className="text-primary font-medium">{sentEmail}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <p className="text-sm text-white/70">
                Click on the link sent to your email to access your account.
                The link expires in 1 hour.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full bg-[#46CCC6] hover:bg-[#46CCC6]/90 text-black font-semibold"
                onClick={() => openEmailProvider(sentEmail)}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open {getEmailProviderName(sentEmail)}
              </Button>

              <Button
                variant="outline"
                className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
                onClick={handleResendLink}
                disabled={isResending}
              >
                {isResending ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend link
                  </>
                )}
              </Button>

              <Button
                variant="ghost"
                className="w-full text-white/60 hover:text-white hover:bg-white/5"
                onClick={handleBack}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go back and use another email
              </Button>
            </div>

            <p className="text-xs text-white/40 text-center">
              Didn't receive the email? Check your spam or junk folder.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Tela inicial de login
  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md bg-card border-white/10">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-6">
            <Logo className="h-16 w-auto" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Welcome</CardTitle>
          <CardDescription className="text-white/60">
            Sign in to access your Meta Ads insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google OAuth - Aparece primeiro */}
          <Button
            type="button"
            variant="outline"
            className="w-full bg-white hover:bg-gray-100 text-gray-900 border-white/20 font-medium h-12"
            onClick={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
          >
            {isGoogleLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
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
                Continue with Google
              </>
            )}
          </Button>

          {/* Divisor */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-white/40">or continue with email</span>
            </div>
          </div>

          {/* Magic Link Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...register('email')}
                disabled={isLoading}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:bg-black focus:border-primary h-12"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#46CCC6] hover:bg-[#46CCC6]/90 text-black font-semibold h-12"
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Continue with email'}
            </Button>
          </form>

          <p className="text-xs text-white/40 text-center">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
