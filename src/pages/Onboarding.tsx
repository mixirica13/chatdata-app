import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Zap, CheckCircle2, Facebook, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  const totalSteps = 2;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      toast.success('Configuração concluída! Bem-vindo ao ChatData.');
      navigate('/dashboard');
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Passo {currentStep} de {totalSteps}
          </p>
        </div>

        <Card>
          {currentStep === 1 && (
            <>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-primary p-4 rounded-2xl">
                    <Zap className="w-12 h-12 text-primary-foreground" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold">Bem-vindo ao ChatData</CardTitle>
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
            </>
          )}

          {currentStep === 2 && (
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
            </>
          )}


          <div className="flex justify-between p-6 border-t">
            <Button
              variant="ghost"
              onClick={handleSkip}
              disabled={currentStep === totalSteps}
            >
              Pular por agora
            </Button>
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handlePrevious}>
                  Anterior
                </Button>
              )}
              <Button onClick={handleNext}>
                {currentStep === totalSteps ? 'Concluir' : 'Próximo'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
