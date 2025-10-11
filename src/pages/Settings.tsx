import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LiquidGlass } from '@/components/LiquidGlass';
import { BottomNav } from '@/components/BottomNav';
import { Logo } from '@/components/Logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { LogOut } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleSaveProfile = async () => {
    try {
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ name, email })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Perfil atualizado com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar perfil');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logout realizado com sucesso!');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer logout');
    }
  };

  return (
    <div className="min-h-screen w-full bg-black flex flex-col p-6 pb-32">
      {/* Logo fixa no header */}
      <div className="w-full flex justify-center pt-0 pb-4">
        <Logo className="h-16 w-auto" />
      </div>

      <div className="w-full max-w-2xl mx-auto space-y-6">
        <LiquidGlass>
          <Card className="bg-transparent border-0">
            <CardHeader>
              <CardTitle className="text-white">Perfil</CardTitle>
              <CardDescription className="text-white/60">
                Suas informações pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20 border-2 border-[#46CCC6]/30">
                  <AvatarImage src={profile?.avatar_url} alt={profile?.name} />
                  <AvatarFallback className="text-2xl bg-[#46CCC6]/20 text-[#46CCC6]">
                    {profile?.name?.charAt(0) || user?.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/80">Nome completo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
              <Button
                onClick={handleSaveProfile}
                className="w-full bg-[#46CCC6] hover:bg-[#46CCC6]/90 text-black font-semibold"
              >
                Salvar alterações
              </Button>
            </CardContent>
          </Card>
        </LiquidGlass>

        <LiquidGlass>
          <Card className="bg-transparent border-0">
            <CardHeader>
              <CardTitle className="text-white">Conta</CardTitle>
              <CardDescription className="text-white/60">
                Gerencie sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair da conta
              </Button>
            </CardContent>
          </Card>
        </LiquidGlass>
      </div>

      <BottomNav />
    </div>
  );
};

export default Settings;
