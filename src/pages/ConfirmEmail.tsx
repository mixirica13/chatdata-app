import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, CheckCircle2, RefreshCw, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { openEmailProvider, getEmailProviderName } from '@/utils/emailProvider';

const ConfirmEmail = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [isResending, setIsResending] = useState(false);
  const [showLoginButton, setShowLoginButton] = useState(false);
  const navigate = useNavigate();

  // Mostrar botão de login após 30 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoginButton(true);
    }, 30000); // 30 segundos

    return () => clearTimeout(timer);
  }, []);

  const handleResendEmail = async () => {
    if (!email) {
      toast.error('Email not found. Please sign up again.');
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

      toast.success('Confirmation email resent! Check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Error resending email. Please try again.');
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
          <CardTitle className="text-2xl font-bold">Confirm your email</CardTitle>
          <CardDescription>
            We sent a confirmation link to your email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">Email sent to:</p>
            <p className="text-sm text-muted-foreground break-all">{email}</p>
          </div>

          <div className="space-y-3 bg-accent/50 p-4 rounded-lg">
            <p className="font-medium text-sm flex items-center gap-2 text-white">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Next steps:
            </p>
            <ol className="space-y-2 text-sm ml-6">
              <li className="flex gap-2">
                <span className="font-semibold text-white">1.</span>
                <span className="text-white">Open your email and look for a message from ChatData</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-white">2.</span>
                <span className="text-white">Click on the confirmation link</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-white">3.</span>
                <span className="text-white">You will be redirected to sign in</span>
              </li>
            </ol>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => openEmailProvider(email)}
              className="w-full"
              disabled={!email}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open {getEmailProviderName(email)}
            </Button>

            <Button
              onClick={handleResendEmail}
              disabled={isResending || !email}
              variant="outline"
              className="w-full"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Resending...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resend email
                </>
              )}
            </Button>

            {showLoginButton && (
              <Button
                onClick={() => navigate('/login')}
                variant="secondary"
                className="w-full"
              >
                Go to Login
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Didn't receive the email? Check your spam or junk folder.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmEmail;
