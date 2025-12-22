import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

const AuthCallback = () => {
  const navigate = useNavigate();
  const processedRef = useRef(false);

  useEffect(() => {
    const processSession = async (session: Session) => {
      if (processedRef.current) return;
      processedRef.current = true;

      const user = session.user;

      // Quick check for subscription - don't wait for subscriber creation
      const { data: profile } = await supabase
        .from('subscribers')
        .select('subscribed')
        .eq('user_id', user.id)
        .maybeSingle();

      // Create subscriber in background if doesn't exist (non-blocking)
      if (!profile) {
        const existingName = user.user_metadata?.name || user.user_metadata?.full_name;
        supabase
          .from('subscribers')
          .insert({
            user_id: user.id,
            email: user.email,
            name: existingName || null,
            subscribed: false
          })
          .then(() => {})
          .catch(console.error);
      }

      // Check for stored returnUrl (from MCP OAuth flow)
      const storedReturnUrl = sessionStorage.getItem('auth_return_url');
      if (storedReturnUrl) {
        sessionStorage.removeItem('auth_return_url');
        navigate(storedReturnUrl, { replace: true });
      } else {
        // Pre-trial: Sempre redireciona para dashboard
        // O onboarding vai ser iniciado automaticamente no dashboard para novos usuários
        // O paywall será mostrado quando atingir o limite de requisições
        navigate('/dashboard', { replace: true });
      }
    };

    const handleAuthCallback = async () => {
      // Check URL hash for tokens (faster than waiting for getSession)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hasTokens = hashParams.has('access_token');

      if (hasTokens) {
        // Tokens in URL - wait for Supabase to process them
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
              subscription.unsubscribe();
              await processSession(session);
            }
          }
        );

        // Timeout fallback
        setTimeout(() => {
          if (!processedRef.current) {
            subscription.unsubscribe();
            navigate('/login', { replace: true });
          }
        }, 8000);
      } else {
        // No tokens in URL - check existing session
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          await processSession(session);
        } else {
          navigate('/login', { replace: true });
        }
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-white/60">Autenticando...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
