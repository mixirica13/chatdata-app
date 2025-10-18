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
import { LogOut, Edit2, X, Check } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const { user, profile, logout, initialize } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async () => {
    try {
      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }

      if (!name.trim()) {
        toast.error('Nome não pode estar vazio');
        return;
      }

      setIsSaving(true);

      console.log('Salvando nome:', name, 'para user_id:', user.id);

      const { data, error } = await supabase
        .from('subscribers')
        .update({ name: name.trim() })
        .eq('user_id', user.id)
        .select();

      console.log('Resultado:', { data, error });

      if (error) throw error;

      // Refresh profile data
      await initialize();

      toast.success('Perfil atualizado com sucesso!');
      setIsEditingName(false);
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast.error(error.message || 'Erro ao atualizar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setName(profile?.name || '');
    setIsEditingName(false);
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
                <div className="flex gap-2">
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditingName}
                    className={`${
                      isEditingName
                        ? 'bg-white/5 border-white/10 text-white'
                        : 'bg-white/5 border-white/10 text-white/60 cursor-not-allowed'
                    } placeholder:text-white/40`}
                  />
                  {!isEditingName ? (
                    <Button
                      onClick={() => setIsEditingName(true)}
                      variant="outline"
                      size="icon"
                      className="border-white/10 bg-white/5 hover:bg-white/10 text-white shrink-0"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        size="icon"
                        className="bg-[#46CCC6] hover:bg-[#46CCC6]/90 text-black shrink-0"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        variant="outline"
                        size="icon"
                        className="border-white/10 bg-white/5 hover:bg-destructive/20 text-white shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-white/5 border-white/10 text-white/60 placeholder:text-white/40 cursor-not-allowed"
                />
                <p className="text-xs text-white/40">O email não pode ser alterado</p>
              </div>
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
