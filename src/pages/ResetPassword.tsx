import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Logo } from '@/components/Logo';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').max(100, 'Senha muito longa'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        toast.error('Link inválido ou expirado');
        setTimeout(() => navigate('/forgot-password'), 2000);
        return;
      }

      setIsValidToken(true);
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
      toast.error('Erro ao verificar link de recuperação');
      setTimeout(() => navigate('/forgot-password'), 2000);
    } finally {
      setIsCheckingToken(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordForm) => {
    setIsLoading(true);
    try {
      console.log('Attempting to update password...');

      const { data: updateData, error } = await supabase.auth.updateUser({
        password: data.password,
      });

      console.log('Update result:', { data: updateData, error });

      if (error) {
        console.error('Update user error:', error);
        throw error;
      }

      toast.success('Senha redefinida com sucesso! Redirecionando...');

      // Wait a moment for the toast to show
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Force page reload to login to avoid auth state issues
      window.location.href = '/login';
    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error);

      // Show more specific error message
      const errorMessage = error.message || 'Erro ao redefinir senha. Tente novamente.';
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  if (isCheckingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <Card className="w-full max-w-md bg-card border-white/10">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <LoadingSpinner size="lg" />
              <p className="text-white/60">Verificando link de recuperação...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <Card className="w-full max-w-md bg-card border-white/10">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-6">
              <Logo className="h-16 w-auto" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Link Inválido</CardTitle>
            <CardDescription className="text-white/60">
              O link de recuperação expirou ou é inválido
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-white/60 text-center">
              Redirecionando para solicitar novo link...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md bg-card border-white/10">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-6">
            <Logo className="h-16 w-auto" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Nova Senha</CardTitle>
          <CardDescription className="text-white/60">
            Digite sua nova senha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80">Nova Senha</Label>
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white/80">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                disabled={isLoading}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:bg-black focus:border-primary"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-[#46CCC6] hover:bg-[#46CCC6]/90 text-black font-semibold"
              disabled={isLoading}
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Redefinir Senha'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
