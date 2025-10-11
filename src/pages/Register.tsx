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
import { toast } from 'sonner';

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Nome muito curto').max(100, 'Nome muito longo'),
  email: z.string().email('Email inválido').trim().max(255, 'Email muito longo'),
  whatsapp: z.string().trim().min(10, 'WhatsApp inválido').max(20, 'WhatsApp muito longo').regex(/^[\d\s\+\-\(\)]+$/, 'WhatsApp deve conter apenas números'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').max(100, 'Senha muito longa'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser, isAuthenticated, initialize } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      await registerUser(data.name, data.email, data.password);
    } catch (error: any) {
      if (error.message === 'REGISTRATION_SUCCESS') {
        toast.success('Conta criada com sucesso!');
        navigate(`/confirm-email?email=${encodeURIComponent(data.email)}`);
      } else {
        toast.error(error.message || 'Erro ao criar conta. Tente novamente.');
      }
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
          <CardTitle className="text-2xl font-bold text-white">Criar conta</CardTitle>
          <CardDescription className="text-white/60">
            Cadastre-se para começar a receber insights via WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white/80">Nome completo</Label>
              <Input
                id="name"
                placeholder="João Silva"
                {...register('name')}
                disabled={isLoading}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:bg-black focus:border-primary"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
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
              <Label htmlFor="whatsapp" className="text-white/80">WhatsApp</Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="+55 11 98765-4321"
                {...register('whatsapp')}
                disabled={isLoading}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:bg-black focus:border-primary"
              />
              {errors.whatsapp && (
                <p className="text-sm text-destructive">{errors.whatsapp.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80">Senha</Label>
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
              <Label htmlFor="confirmPassword" className="text-white/80">Confirmar senha</Label>
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
            <Button type="submit" className="w-full bg-[#46CCC6] hover:bg-[#46CCC6]/90 text-black font-semibold" disabled={isLoading}>
              {isLoading ? <LoadingSpinner size="sm" /> : 'Criar conta'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-sm text-white/60 text-center">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Fazer login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
