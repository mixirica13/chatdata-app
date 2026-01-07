import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Zap } from 'lucide-react';
import { useTracking } from '@/hooks/useTracking';
import { supabase } from '@/integrations/supabase/client';

const EmailConfirmed = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const { trackEvent, trackPageView } = useTracking();

  useEffect(() => {
    // Process any auth tokens in URL to ensure email confirmation is complete
    // Then sign out to keep the expected flow (user must login manually)
    const processConfirmation = async () => {
      try {
        // This processes any tokens in the URL hash automatically
        const { data: { session } } = await supabase.auth.getSession();

        // If a session was created, sign out to maintain expected flow
        if (session) {
          await supabase.auth.signOut();
        }
      } catch (error) {
        console.error('Error processing email confirmation:', error);
      }
    };

    processConfirmation();

    // Track email confirmation
    trackPageView('email_confirmed_page');
    trackEvent('email_confirmed');
  }, [trackPageView, trackEvent]);

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
          <CardTitle className="text-2xl font-bold">Email confirmed!</CardTitle>
          <CardDescription>
            Your account has been successfully activated
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
            <p className="text-sm text-green-900 dark:text-green-100 text-center">
              Congratulations! You can now sign in and start using ChatData.
            </p>
          </div>

          <div className="space-y-3 bg-accent/50 p-4 rounded-lg">
            <p className="font-medium text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Next steps:
            </p>
            <ol className="space-y-2 text-sm text-muted-foreground ml-6">
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">1.</span>
                <span>Sign in with your credentials</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">2.</span>
                <span>Connect your Meta Ads account</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">3.</span>
                <span>Start receiving smart insights</span>
              </li>
            </ol>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => navigate('/login')}
              className="w-full"
              size="lg"
            >
              Go to Login
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Automatically redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfirmed;
