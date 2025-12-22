import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Logo } from '@/components/Logo';
import { CheckCircle2, XCircle, AlertCircle, Shield, BarChart3, Database } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * MCP OAuth Authorization Page
 *
 * This page handles the OAuth flow for MCP (Model Context Protocol) clients.
 * It receives redirect_uri, state, and client_id from the MCP server,
 * verifies user authentication and Meta connection, then redirects back
 * with an authorization code.
 *
 * Flow:
 * 1. MCP server redirects user here with ?redirect_uri=...&state=...&client_id=...
 * 2. If not authenticated, redirect to login with returnUrl
 * 3. If no Meta connection, show error
 * 4. Show authorization screen
 * 5. On approve, generate auth code and redirect back to MCP server
 */

const McpAuth = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated, isLoading: authLoading, metaConnected, initialize } = useAuth();
  const navigate = useNavigate();

  // Get OAuth parameters from URL
  const redirectUri = searchParams.get('redirect_uri');
  const state = searchParams.get('state');
  const clientId = searchParams.get('client_id');

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    // Validate required parameters
    if (!redirectUri || !state) {
      setError('Parâmetros inválidos. Faltando redirect_uri ou state.');
      setIsLoading(false);
      return;
    }

    // Validate redirect_uri is a valid URL
    try {
      new URL(redirectUri);
    } catch {
      setError('redirect_uri inválido.');
      setIsLoading(false);
      return;
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      const returnUrl = `/auth/mcp?${searchParams.toString()}`;
      navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    // If authenticated but no Meta connection, show error
    if (!metaConnected) {
      setError('Você precisa conectar sua conta Meta Ads antes de autorizar.');
      setIsLoading(false);
      return;
    }

    // All checks passed
    setIsLoading(false);
  }, [authLoading, isAuthenticated, metaConnected, redirectUri, state, navigate, searchParams]);

  /**
   * Generate a cryptographically secure authorization code
   */
  const generateAuthCode = (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  /**
   * Handle authorization approval
   */
  const handleAuthorize = async () => {
    if (!user || !redirectUri || !state) return;

    setIsAuthorizing(true);

    try {
      // Generate authorization code
      const code = generateAuthCode();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Store code in database
      const { error: insertError } = await supabase
        .from('mcp_auth_codes')
        .insert({
          code,
          user_id: user.id,
          client_id: clientId,
          redirect_uri: redirectUri,
          expires_at: expiresAt.toISOString(),
        });

      if (insertError) {
        console.error('Error storing auth code:', insertError);
        toast.error('Erro ao gerar código de autorização.');
        setIsAuthorizing(false);
        return;
      }

      // Redirect back to MCP server with code and state
      const callbackUrl = new URL(redirectUri);
      callbackUrl.searchParams.set('code', code);
      callbackUrl.searchParams.set('state', state);

      // Use window.location for full page redirect
      window.location.href = callbackUrl.toString();
    } catch (err) {
      console.error('Authorization error:', err);
      toast.error('Erro ao autorizar. Tente novamente.');
      setIsAuthorizing(false);
    }
  };

  /**
   * Handle authorization denial
   */
  const handleDeny = () => {
    if (!redirectUri || !state) return;

    const callbackUrl = new URL(redirectUri);
    callbackUrl.searchParams.set('error', 'access_denied');
    callbackUrl.searchParams.set('error_description', 'User denied access');
    callbackUrl.searchParams.set('state', state);

    window.location.href = callbackUrl.toString();
  };

  /**
   * Handle connecting Meta account
   */
  const handleConnectMeta = () => {
    // Save current URL to return after connecting
    const returnUrl = `/auth/mcp?${searchParams.toString()}`;
    sessionStorage.setItem('mcp_auth_return_url', returnUrl);
    navigate('/connect/meta');
  };

  // Loading state
  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <Card className="w-full max-w-md bg-card border-white/10">
          <CardContent className="py-12 flex flex-col items-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-white/60">Verificando autenticação...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state - missing Meta connection
  if (error && !metaConnected && isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <Card className="w-full max-w-md bg-card border-white/10">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">Conexão Necessária</CardTitle>
            <CardDescription className="text-white/60">
              Conecte sua conta Meta Ads para continuar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-yellow-500/30 bg-yellow-500/10">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-white/80">
                {error}
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button
                onClick={handleConnectMeta}
                className="w-full bg-[#46CCC6] hover:bg-[#46CCC6]/90 text-black font-semibold"
              >
                Conectar Meta Ads
              </Button>
              <Button
                variant="outline"
                onClick={handleDeny}
                className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state - generic
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <Card className="w-full max-w-md bg-card border-white/10">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">Erro</CardTitle>
            <CardDescription className="text-white/60">
              Não foi possível processar a autorização
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Authorization screen
  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md bg-card border-white/10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo className="h-12 w-auto" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Autorizar Acesso</CardTitle>
          <CardDescription className="text-white/60">
            <span className="font-medium text-white">Meta Ads MCP Server</span>
            {' '}deseja acessar seus dados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* App Info */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/600px-Facebook_Logo_%282019%29.png"
                  alt="Meta"
                  className="w-6 h-6"
                />
              </div>
              <div>
                <p className="font-medium text-white">Meta Ads MCP Server</p>
                <p className="text-xs text-white/50">via Claude Desktop / Claude.ai</p>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-white/80">Este app poderá:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm">
                <BarChart3 className="w-4 h-4 text-[#46CCC6] flex-shrink-0 mt-0.5" />
                <span className="text-white/70">Ver métricas de campanhas e anúncios</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Database className="w-4 h-4 text-[#46CCC6] flex-shrink-0 mt-0.5" />
                <span className="text-white/70">Acessar dados de contas de anúncios</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Shield className="w-4 h-4 text-[#46CCC6] flex-shrink-0 mt-0.5" />
                <span className="text-white/70">Ler informações somente (sem modificar)</span>
              </li>
            </ul>
          </div>

          {/* User Info */}
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-sm text-white/70">
                Logado como <span className="font-medium text-white">{user?.email}</span>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={handleAuthorize}
              disabled={isAuthorizing}
              className="w-full bg-[#46CCC6] hover:bg-[#46CCC6]/90 text-black font-semibold h-12"
            >
              {isAuthorizing ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Autorizando...</span>
                </>
              ) : (
                'Autorizar'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleDeny}
              disabled={isAuthorizing}
              className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              Cancelar
            </Button>
          </div>

          <p className="text-xs text-white/40 text-center">
            Ao autorizar, você concorda com nossos{' '}
            <a href="/termos" className="text-[#46CCC6] hover:underline">Termos de Serviço</a>
            {' '}e{' '}
            <a href="/privacidade" className="text-[#46CCC6] hover:underline">Política de Privacidade</a>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default McpAuth;
