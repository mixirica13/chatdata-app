import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";

type VerificationStatus = "verifying" | "success" | "error" | "expired" | "used";

export default function WhatsAppVerify() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setErrorMessage("Token não fornecido");
      return;
    }

    verifyToken(token);
  }, [searchParams]);

  const verifyToken = async (token: string) => {
    try {
      // AJUSTE AQUI: URL do seu N8N webhook de validação
      const response = await fetch("https://webhook.vps.ordershub.com.br/webhook/whatsapp-verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (data.success) {
        // Token válido - fazer login no Supabase
        const { userId, phone } = data;

        // Criar sessão usando o phone como email temporário
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email: `${phone}@whatsapp.local`,
          password: userId, // Usar userId como senha temporária
        });

        if (error) {
          // Se falhar, tentar criar o usuário
          if (data.action === "register") {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email: `${phone}@whatsapp.local`,
              password: userId,
              options: {
                data: {
                  phone: phone,
                  auth_method: "whatsapp",
                },
              },
            });

            if (signUpError) {
              throw signUpError;
            }

            // Atualizar subscriber com número do WhatsApp
            if (signUpData.user) {
              await supabase
                .from('subscribers')
                .update({
                  whatsapp_connected: true,
                  whatsapp_phone: phone,
                })
                .eq('user_id', signUpData.user.id);
            }
          } else {
            throw error;
          }
        } else {
          // Login bem-sucedido - atualizar subscriber com número do WhatsApp
          if (authData.user) {
            await supabase
              .from('subscribers')
              .update({
                whatsapp_connected: true,
                whatsapp_phone: phone,
              })
              .eq('user_id', authData.user.id);
          }
        }

        setStatus("success");

        toast({
          title: "Bem-vindo!",
          description: "Login realizado com sucesso.",
        });

        // Redirecionar após 2 segundos
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        // Verificar tipo de erro
        if (data.errorCode === "TOKEN_EXPIRED") {
          setStatus("expired");
          setErrorMessage("Link expirado");
        } else if (data.errorCode === "TOKEN_ALREADY_USED") {
          setStatus("used");
          setErrorMessage("Este link já foi utilizado");
        } else {
          setStatus("error");
          setErrorMessage(data.message || "Token inválido");
        }
      }
    } catch (error) {
      console.error("Erro ao verificar token:", error);
      setStatus("error");
      setErrorMessage("Erro ao processar autenticação");

      toast({
        title: "Erro",
        description: "Não foi possível completar a autenticação.",
        variant: "destructive",
      });
    }
  };

  const renderContent = () => {
    switch (status) {
      case "verifying":
        return (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Verificando...</h3>
              <p className="text-sm text-muted-foreground">
                Aguarde enquanto validamos seu acesso
              </p>
            </div>
          </div>
        );

      case "success":
        return (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="p-4 bg-green-500/10 rounded-full">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-green-600">
                Autenticação bem-sucedida!
              </h3>
              <p className="text-sm text-muted-foreground">
                Redirecionando para o dashboard...
              </p>
            </div>
          </div>
        );

      case "expired":
        return (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="p-4 bg-orange-500/10 rounded-full">
              <AlertCircle className="h-16 w-16 text-orange-500" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-orange-600">
                Link expirado
              </h3>
              <p className="text-sm text-muted-foreground">
                Este link de acesso expirou. Solicite um novo link para continuar.
              </p>
            </div>
            <Button onClick={() => navigate("/whatsapp-login")} size="lg">
              Solicitar novo link
            </Button>
          </div>
        );

      case "used":
        return (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="p-4 bg-blue-500/10 rounded-full">
              <AlertCircle className="h-16 w-16 text-blue-500" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-blue-600">
                Link já utilizado
              </h3>
              <p className="text-sm text-muted-foreground">
                Este link já foi usado. Se você já está logado, vá para o dashboard.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => navigate("/dashboard")} size="lg">
                Ir para dashboard
              </Button>
              <Button
                onClick={() => navigate("/whatsapp-login")}
                variant="outline"
                size="lg"
              >
                Novo login
              </Button>
            </div>
          </div>
        );

      case "error":
        return (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="p-4 bg-red-500/10 rounded-full">
              <XCircle className="h-16 w-16 text-red-500" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-red-600">
                Erro ao autenticar
              </h3>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
            </div>
            <Button onClick={() => navigate("/whatsapp-login")} size="lg">
              Tentar novamente
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-2">
          <Logo size="lg" />
          <h1 className="text-2xl font-bold">Meta Aura</h1>
        </div>

        {/* Card de Verificação */}
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              Verificação WhatsApp
            </CardTitle>
            <CardDescription className="text-center">
              Validando seu link de acesso
            </CardDescription>
          </CardHeader>

          <CardContent>{renderContent()}</CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Problemas? Tente solicitar um novo link de acesso
        </p>
      </div>
    </div>
  );
}
