import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Zap, CheckCircle2, Facebook, User, Bot, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasExistingName, setHasExistingName] = useState(false);
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const totalSteps = 4;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Check if user already has a name
  useEffect(() => {
    const checkExistingName = async () => {
      if (user) {
        // Check user_metadata first
        const existingName = user.user_metadata?.name || user.user_metadata?.full_name;
        if (existingName) {
          setName(existingName);
          setHasExistingName(true);
          setCurrentStep(1); // Skip name step
        } else if (profile?.name) {
          setName(profile.name);
          setHasExistingName(true);
          setCurrentStep(1); // Skip name step
        }
      }
    };
    checkExistingName();
  }, [user, profile]);

  const handleSaveName = async () => {
    if (!name.trim()) {
      toast.error('Por favor, insira seu nome');
      return;
    }

    setIsSaving(true);
    try {
      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { name: name.trim() }
      });

      if (updateError) throw updateError;

      // Also update subscribers table if exists
      if (user) {
        await supabase
          .from('subscribers')
          .update({ name: name.trim() })
          .eq('user_id', user.id);
      }

      setCurrentStep(1);
    } catch (error: any) {
      console.error('Error saving name:', error);
      toast.error('Erro ao salvar nome. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      toast.success('Configuração concluída! Bem-vindo ao ChatData.');
      navigate('/custom-dashboard');
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  const handlePrevious = () => {
    if (currentStep > 0 && !hasExistingName) {
      setCurrentStep(currentStep - 1);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Passo {currentStep + 1} de {totalSteps}
          </p>
        </div>

        <Card>
          {/* Step 0: Name Collection */}
          {currentStep === 0 && (
            <>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-primary p-4 rounded-2xl">
                    <User className="w-12 h-12 text-primary-foreground" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">Como podemos te chamar?</CardTitle>
                <CardDescription className="text-base mt-2">
                  Nos diga seu nome para personalizarmos sua experiência
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Seu nome</Label>
                  <Input
                    id="name"
                    placeholder="Ex: João Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-lg h-12"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveName();
                      }
                    }}
                  />
                </div>
              </CardContent>
              <div className="flex justify-between p-6 border-t">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                >
                  Pular por agora
                </Button>
                <Button onClick={handleSaveName} disabled={isSaving || !name.trim()}>
                  {isSaving ? <LoadingSpinner size="sm" /> : 'Continuar'}
                </Button>
              </div>
            </>
          )}

          {/* Step 1: Welcome - COMENTADO (WhatsApp removido temporariamente)
          {currentStep === 1 && (
            <>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-primary p-4 rounded-2xl">
                    <Zap className="w-12 h-12 text-primary-foreground" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold">
                  {name ? `Bem-vindo, ${name.split(' ')[0]}!` : 'Bem-vindo ao ChatData'}
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Receba insights inteligentes das suas campanhas de Meta Ads com análises automáticas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Análises automáticas</h4>
                      <p className="text-sm text-muted-foreground">
                        IA analisa suas campanhas 24/7 e identifica oportunidades
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Suporte especializado</h4>
                      <p className="text-sm text-muted-foreground">
                        Tire dúvidas sobre tráfego pago com nossa equipe via WhatsApp
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Otimização contínua</h4>
                      <p className="text-sm text-muted-foreground">
                        Melhore seu ROAS com sugestões baseadas em dados reais
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <div className="flex justify-between p-6 border-t">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                >
                  Pular por agora
                </Button>
                <div className="flex gap-2">
                  {!hasExistingName && (
                    <Button variant="outline" onClick={handlePrevious}>
                      Anterior
                    </Button>
                  )}
                  <Button onClick={handleNext}>
                    Próximo
                  </Button>
                </div>
              </div>
            </>
          )}
          */}

          {/* Step 1: Connect Meta */}
          {currentStep === 1 && (
            <>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-500 p-4 rounded-2xl">
                    <Facebook className="w-12 h-12 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">Conectar Meta Ads</CardTitle>
                <CardDescription className="text-base mt-2">
                  Precisamos acessar suas contas de anúncios para fornecer insights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <p className="font-medium">Permissões necessárias:</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Ler dados de campanhas e anúncios
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Acessar métricas de performance
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Ver informações de públicos
                    </li>
                  </ul>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Seus dados são seguros e nunca serão compartilhados com terceiros
                </p>
              </CardContent>
              <div className="flex justify-between p-6 border-t">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                >
                  Pular por agora
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handlePrevious}>
                    Anterior
                  </Button>
                  <Button onClick={handleNext}>
                    Próximo
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Step 2: MCP Integration */}
          {currentStep === 2 && (
            <>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-purple-500 p-4 rounded-2xl">
                    <Bot className="w-12 h-12 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">Integração MCP</CardTitle>
                <CardDescription className="text-base mt-2">
                  Conecte suas ferramentas de IA favoritas para análises avançadas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <p className="font-medium">Integrações disponíveis:</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Claude Desktop e Claude.ai
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ChatGPT
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Outras LLMs compatíveis com MCP
                    </li>
                  </ul>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Consulte seus dados de Meta Ads diretamente na sua IA preferida
                </p>
              </CardContent>
              <div className="flex justify-between p-6 border-t">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                >
                  Pular por agora
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handlePrevious}>
                    Anterior
                  </Button>
                  <Button onClick={handleNext}>
                    Próximo
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Step 3: Dashboard Customizável */}
          {currentStep === 3 && (
            <>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-green-500 p-4 rounded-2xl">
                    <LayoutDashboard className="w-12 h-12 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">Dashboard Customizável</CardTitle>
                <CardDescription className="text-base mt-2">
                  Visualize suas métricas do jeito que você preferir
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <p className="font-medium">Recursos do Dashboard:</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Arraste e solte widgets
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Escolha suas métricas favoritas
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Visualização em tempo real
                    </li>
                  </ul>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Personalize seu painel para focar no que realmente importa
                </p>
              </CardContent>
              <div className="flex justify-between p-6 border-t">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                >
                  Pular por agora
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handlePrevious}>
                    Anterior
                  </Button>
                  <Button onClick={handleNext}>
                    Concluir
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
