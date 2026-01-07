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
import { LogOut, Edit2, X, Check, Phone } from 'lucide-react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import '@/styles/phone-input.css';

const Settings = () => {
  const navigate = useNavigate();
  const { user, profile, logout, initialize } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [whatsapp, setWhatsapp] = useState(profile?.whatsapp_phone || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingWhatsapp, setIsEditingWhatsapp] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingWhatsapp, setIsSavingWhatsapp] = useState(false);

  const handleSaveProfile = async () => {
    try {
      if (!user) {
        toast.error('User not authenticated');
        return;
      }

      if (!name.trim()) {
        toast.error('Name cannot be empty');
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

      toast.success('Profile updated successfully!');
      setIsEditingName(false);
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast.error(error.message || 'Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setName(profile?.name || '');
    setIsEditingName(false);
  };

  const handleSaveWhatsapp = async () => {
    try {
      if (!user) {
        toast.error('User not authenticated');
        return;
      }

      // Validate phone number if provided
      if (whatsapp && !isValidPhoneNumber(whatsapp)) {
        toast.error('Invalid WhatsApp number');
        return;
      }

      setIsSavingWhatsapp(true);

      const { error } = await supabase
        .from('subscribers')
        .update({ whatsapp_phone: whatsapp || null })
        .eq('user_id', user.id);

      if (error) throw error;

      await initialize();
      toast.success('WhatsApp updated successfully!');
      setIsEditingWhatsapp(false);
    } catch (error: any) {
      console.error('Erro ao salvar WhatsApp:', error);
      toast.error(error.message || 'Error updating WhatsApp');
    } finally {
      setIsSavingWhatsapp(false);
    }
  };

  const handleCancelWhatsappEdit = () => {
    setWhatsapp(profile?.whatsapp_phone || '');
    setIsEditingWhatsapp(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully!');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Error logging out');
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
              <CardTitle className="text-white">Profile</CardTitle>
              <CardDescription className="text-white/60">
                Your personal information
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
                <Label htmlFor="name" className="text-white/80">Full name</Label>
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
                <p className="text-xs text-white/40">Email cannot be changed</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-white/80 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  WhatsApp (optional)
                </Label>
                <div className="flex gap-2">
                  {isEditingWhatsapp ? (
                    <>
                      <PhoneInput
                        international
                        defaultCountry="BR"
                        value={whatsapp}
                        onChange={(value) => setWhatsapp(value || '')}
                        className="phone-input flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white focus-within:border-primary focus-within:bg-black transition-colors"
                        numberInputProps={{
                          className: "bg-transparent border-none outline-none text-white placeholder:text-white/40 w-full"
                        }}
                      />
                      <Button
                        onClick={handleSaveWhatsapp}
                        disabled={isSavingWhatsapp}
                        size="icon"
                        className="bg-[#46CCC6] hover:bg-[#46CCC6]/90 text-black shrink-0"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={handleCancelWhatsappEdit}
                        disabled={isSavingWhatsapp}
                        variant="outline"
                        size="icon"
                        className="border-white/10 bg-white/5 hover:bg-destructive/20 text-white shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Input
                        id="whatsapp-display"
                        value={whatsapp || 'Not provided'}
                        disabled
                        className="bg-white/5 border-white/10 text-white/60 placeholder:text-white/40 cursor-not-allowed"
                      />
                      <Button
                        onClick={() => setIsEditingWhatsapp(true)}
                        variant="outline"
                        size="icon"
                        className="border-white/10 bg-white/5 hover:bg-white/10 text-white shrink-0"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
                <p className="text-xs text-white/40">Receive campaign insights directly on WhatsApp</p>
              </div>
            </CardContent>
          </Card>
        </LiquidGlass>

        <LiquidGlass>
          <Card className="bg-transparent border-0">
            <CardHeader>
              <CardTitle className="text-white">Account</CardTitle>
              <CardDescription className="text-white/60">
                Manage your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
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
