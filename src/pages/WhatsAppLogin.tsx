import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageCircle, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";

export default function WhatsAppLogin() {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const formatPhone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");

    // Limita a 11 dígitos (DDD + 9 dígitos)
    const limited = numbers.slice(0, 11);

    // Formata: (11) 99999-9999
    if (limited.length <= 2) {
      return limited;
    } else if (limited.length <= 7) {
      return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
    } else {
      return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanPhone = phone.replace(/\D/g, "");

    if (cleanPhone.length < 10) {
      toast({
        title: "Telefone inválido",
        description: "Por favor, insira um número de telefone válido.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Adiciona +55 para Brasil
      const fullPhone = `55${cleanPhone}`;

      // AJUSTE AQUI: URL do seu N8N webhook
      const response = await fetch("https://webhook.vps.ordershub.com.br/webhook/whatsapp-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: fullPhone,
          userId: user?.id || null
        }),
      });

      const data = await response.json();

      if (data.success) {
        setLinkSent(true);
        toast({
          title: "Link enviado!",
          description: "Verifique seu WhatsApp e clique no link para continuar.",
        });
      } else {
        throw new Error(data.message || "Erro ao enviar link");
      }
    } catch (error) {
      console.error("Erro ao enviar magic link:", error);
      toast({
        title: "Erro ao enviar link",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    setLinkSent(false);
    setPhone("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-2">
          <Logo size="lg" />
          <h1 className="text-2xl font-bold">ChatData</h1>
          <p className="text-muted-foreground text-center">
            Entre com seu WhatsApp
          </p>
        </div>

        {/* Card de Login */}
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-green-500/10 rounded-full">
                <MessageCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">
              {linkSent ? "Link enviado!" : "Login com WhatsApp"}
            </CardTitle>
            <CardDescription className="text-center">
              {linkSent
                ? "Abra seu WhatsApp e clique no link que enviamos"
                : "Receba um link de acesso direto no seu WhatsApp"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!linkSent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Número do WhatsApp</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={handlePhoneChange}
                    disabled={isLoading}
                    className="text-lg"
                    autoComplete="tel"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    Digite seu número com DDD
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading || phone.replace(/\D/g, "").length < 10}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Receber link no WhatsApp
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center py-6 space-y-4">
                  <div className="p-4 bg-green-500/10 rounded-full">
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Enviamos um link de acesso para
                    </p>
                    <p className="font-semibold text-lg">{phone}</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg text-sm text-center space-y-2">
                    <p className="font-medium">O que fazer agora:</p>
                    <ol className="text-left space-y-1 text-muted-foreground">
                      <li>1. Abra o WhatsApp</li>
                      <li>2. Clique no link que enviamos</li>
                      <li>3. Você será autenticado automaticamente</li>
                    </ol>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ⏰ O link expira em 10 minutos
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    onClick={handleResend}
                    className="w-full"
                  >
                    Enviar para outro número
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/login")}
                    className="w-full"
                  >
                    Voltar para login tradicional
                  </Button>
                </div>
              </div>
            )}

            {!linkSent && (
              <div className="mt-6 text-center">
                <Button
                  variant="link"
                  onClick={() => navigate("/login")}
                  className="text-sm"
                >
                  Usar email e senha
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Ao continuar, você concorda com nossos Termos de Uso
        </p>
      </div>
    </div>
  );
}
