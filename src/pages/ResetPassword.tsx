import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Logo } from '@/components/Logo';
import { supabase } from '@/integrations/supabase/client';

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [debugStatus, setDebugStatus] = useState<string>("Initializing...");
  const navigate = useNavigate();
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if we have a session or if we are in the process of recovering
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setDebugStatus(session ? "Session Active (Initial Check)" : "No Session (Initial Check)");

      if (!session) {
        // If no session, check if we have the hash fragments that Supabase sends
        const hash = window.location.hash;
        if (!hash || !hash.includes('type=recovery')) {
          // If no recovery hash and no session, this is invalid access
          setDebugStatus("Invalid Access: No session and no recovery hash");
          toast.error("Link inválido ou expirado. Por favor, solicite uma nova redefinição de senha.");
          // navigate("/login");
        } else {
          setDebugStatus("Recovery Hash Detected. Waiting for Supabase...");
        }
      }
    };
    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event);
      setDebugStatus(`Auth Event: ${event} | Session: ${session ? "Yes" : "No"}`);

      if (event === "PASSWORD_RECOVERY") {
        // User clicked the link and is now authenticated with a recovery token
      }

      // If we receive a USER_UPDATED event and we are loading, it means the password update worked
      // even if the promise is still pending/timed out.
      if (event === "USER_UPDATED") {
        console.log("USER_UPDATED event received. Treating as success.");
        setShowSuccess(true);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Countdown timer and auto-redirect after success
  useEffect(() => {
    if (showSuccess) {
      // Start countdown
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            navigate('/login');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(countdownInterval);
      };
    }
  }, [showSuccess, navigate]);

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
    console.log("Starting password reset process...");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Current session:", session);

      if (!session) {
        throw new Error("Sessão não encontrada. O link pode ter expirado.");
      }

      console.log("Calling updateUser...");

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );

      // Race the update against the timeout
      const { error } = await Promise.race([
        supabase.auth.updateUser({ password: password }),
        timeoutPromise
      ]) as any;

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Password updated successfully");

      // IMPORTANTE: Fazer logout após redefinir senha por segurança
      // O usuário deve fazer login novamente com a nova senha
      await supabase.auth.signOut();
      console.log("User signed out after password reset");

      setShowSuccess(true);
    } catch (error: any) {
      console.error("Error resetting password:", error);
      if (error.message === 'Timeout') {
        toast.error('A operação demorou muito. Verifique sua conexão e tente novamente.');
      } else {
        toast.error(error.message || 'Ocorreu um erro ao redefinir a senha.');
      }
    } finally {
      setLoading(false);
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
          {/* Debug Info */}
          <div className="mt-2 p-2 bg-gray-800 rounded text-xs text-left font-mono text-yellow-400 break-all">
            Debug Status: {debugStatus}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80">Nova senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
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
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
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
              Sua senha foi redefinida com segurança. Faça login novamente com sua nova senha.
              <br />
              <span className="text-[#46CCC6] font-semibold">Redirecionando em {countdown}s...</span>
            </DialogDescription>
            <Button
              onClick={() => navigate('/login')}
              className="w-full bg-[#46CCC6] hover:bg-[#46CCC6]/90 text-black font-semibold h-12"
            >
              Ir para Login agora
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
