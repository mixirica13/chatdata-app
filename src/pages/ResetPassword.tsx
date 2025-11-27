import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Logo } from '@/components/Logo';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const hash = window.location.hash.substring(1);
  const searchParams = new URLSearchParams(hash);

  useEffect(() => {
    const checkSessionAndParams = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      console.log('URL completa:', window.location.href);
      console.log('Todos os parâmetros da URL:', Object.fromEntries(searchParams));

      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');
      const tokenHash = searchParams.get('token_hash');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      console.log('Parâmetros específicos:');
      console.log('- access_token:', accessToken);
      console.log('- refresh_token:', refreshToken);
      console.log('- type:', type);
      console.log('- token_hash:', tokenHash);
      console.log('- error:', error);
      console.log('- error_description:', errorDescription);

      if (error) {
        console.error('Erro na URL:', error, errorDescription);
        toast.error(`Erro: ${errorDescription || error}`);
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      const hasTokens = accessToken && refreshToken;
      const hasTokenHash = tokenHash;
      const hasValidType = type === 'recovery' || type === 'magiclink' || type === 'signup';
      const hasAnyParams = accessToken || refreshToken || tokenHash || type;

      if (!hasAnyParams && !session) {
        console.log('Acesso direto à página de redefinição - redirecionando para login');
        toast.error('Acesse esta página através do link enviado por e-mail');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      if (hasAnyParams && !hasTokens && !hasTokenHash) {
        console.error('Parâmetros inválidos - nem tokens nem token_hash encontrados');
        toast.error('Link de recuperação inválido ou expirado');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (type && !hasValidType) {
        console.error('Tipo de link inválido:', type);
        toast.error('Tipo de link não suportado');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      console.log('Validando link de recuperação');

      if (hasTokens) {
        console.log('Definindo sessão com tokens válidos');
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          console.error('Erro ao definir sessão:', error);
          toast.error('Erro ao validar link de recuperação');
          setTimeout(() => navigate('/login'), 3000);
        } else {
          console.log('Sessão definida com sucesso');
          toast.success('Link válido! Você pode redefinir sua senha.');
        }
      } else if (hasTokenHash) {
        console.log('Link com token_hash detectado - aguardando autenticação automática');
        toast.success('Link válido! Você pode redefinir sua senha.');
      } else if (session) {
        console.log('Sessão existente detectada - permitindo redefinição');
        toast.success('Sessão válida! Você pode redefinir sua senha.');
      } else {
        console.log('Link válido detectado');
        toast.success('Link válido! Você pode redefinir sua senha.');
      }
    };

    checkSessionAndParams();
  }, [navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setShowSuccess(true);
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      toast.error('Ocorreu um erro. Por favor, tente novamente.');
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
          <CardTitle className="text-2xl font-bold text-white">Redefinir senha</CardTitle>
          <CardDescription className="text-white/60">
            Digite sua nova senha abaixo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80">Nova senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:bg-black focus:border-primary pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white/80">Confirmar nova senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:bg-black focus:border-primary pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#46CCC6] hover:bg-[#46CCC6]/90 text-black font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redefinindo...
                </>
              ) : (
                'Redefinir senha'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md bg-card border-white/10">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="bg-[#46CCC6]/20 rounded-full p-3 mb-6 animate-[pulse_2s_ease-in-out_1]">
              <CheckCircle className="h-14 w-14 text-[#46CCC6]" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center mb-2 text-white">
              Senha alterada com sucesso!
            </DialogTitle>
            <DialogDescription className="text-center text-white/60 mb-6">
              Sua senha foi redefinida com segurança. Você já pode acessar sua conta com a nova senha.
            </DialogDescription>
            <Button
              onClick={() => navigate('/login')}
              className="w-full bg-[#46CCC6] hover:bg-[#46CCC6]/90 text-black font-semibold h-12"
            >
              Ir para Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResetPassword;
