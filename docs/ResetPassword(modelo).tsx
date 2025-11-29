import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const hash = window.location.hash.substring(1);
  const searchParams = new URLSearchParams(hash);
  const navigate = useNavigate();

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

    setLoading(true);

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
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary/10 to-primary/5">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-100">
          <div className="flex flex-col items-center justify-center mb-8">
            <img
              src="/images/Logo 2.png"
              alt="Delivery Pulse Logo"
              className="h-24 mb-6"
            />
            <h2 className="text-2xl font-bold text-primary">
              Redefinir senha
            </h2>
            <p className="text-gray-500 mt-1 text-center">
              Digite sua nova senha
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Nova senha
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar nova senha
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-medium mt-6"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redefinindo...
                </>
              ) : (
                "Redefinir senha"
              )}
            </Button>
          </form>
        </div>

        <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
          <DialogContent className="sm:max-w-md border-0 shadow-lg">
            <div className="flex flex-col items-center justify-center py-6">
              <div className="bg-green-100 rounded-full p-3 mb-6 animate-[pulse_2s_ease-in-out_1]">
                <CheckCircle className="h-14 w-14 text-green-600" />
              </div>
              <DialogTitle className="text-2xl font-bold text-center mb-2">Senha alterada com sucesso!</DialogTitle>
              <DialogDescription className="text-center text-gray-600 mb-6">
                Sua senha foi redefinida com segurança. Você já pode acessar sua conta com a nova senha.
              </DialogDescription>
              <Button 
                onClick={() => navigate('/login')} 
                className="w-full py-6 h-12 text-base font-medium rounded-lg transition-all duration-200 hover:shadow-md"
              >
                Ir para Login
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="mt-8 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} OrdersHub. Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
}