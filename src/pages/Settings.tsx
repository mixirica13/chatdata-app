import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ConnectionCard } from '@/components/ConnectionCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Facebook, MessageCircle, Bell, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, updateUser, metaConnected, whatsappConnected, connectMeta, disconnectMeta, connectWhatsapp, disconnectWhatsapp } = useAuthStore();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleSaveProfile = () => {
    updateUser({ name, email });
    toast.success('Perfil atualizado com sucesso!');
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Configurações</h1>
              <p className="text-muted-foreground mt-1">
                Gerencie suas preferências e configurações da conta
              </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">Perfil</TabsTrigger>
                <TabsTrigger value="connections">Conexões</TabsTrigger>
                <TabsTrigger value="notifications">Notificações</TabsTrigger>
                <TabsTrigger value="security">Segurança</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações do Perfil</CardTitle>
                    <CardDescription>
                      Atualize suas informações pessoais
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="text-2xl">{user?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <Button variant="outline">Alterar foto</Button>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome completo</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleSaveProfile}>Salvar alterações</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="connections">
                <div className="space-y-4">
                  <ConnectionCard
                    title="Meta Ads"
                    description="Gerencie a conexão com suas contas de anúncios"
                    icon={Facebook}
                    connected={metaConnected}
                    onConnect={() => navigate('/connect/meta')}
                    onDisconnect={disconnectMeta}
                  />
                  <ConnectionCard
                    title="WhatsApp"
                    description="Gerencie a conexão com o WhatsApp"
                    icon={MessageCircle}
                    connected={whatsappConnected}
                    onConnect={() => navigate('/connect/whatsapp')}
                    onDisconnect={disconnectWhatsapp}
                  />
                </div>
              </TabsContent>

              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Preferências de Notificações</CardTitle>
                    <CardDescription>
                      Escolha como deseja receber notificações
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Insights de performance</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba notificações sobre mudanças significativas
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Alertas de orçamento</Label>
                        <p className="text-sm text-muted-foreground">
                          Avisos quando campanhas atingirem limite de gastos
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Recomendações da IA</Label>
                        <p className="text-sm text-muted-foreground">
                          Sugestões de otimização de campanhas
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Relatórios semanais</Label>
                        <p className="text-sm text-muted-foreground">
                          Resumo semanal de todas as campanhas
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Segurança da Conta</CardTitle>
                    <CardDescription>
                      Gerencie a segurança da sua conta
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Alterar senha</h3>
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="current-password">Senha atual</Label>
                            <Input id="current-password" type="password" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-password">Nova senha</Label>
                            <Input id="new-password" type="password" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                            <Input id="confirm-password" type="password" />
                          </div>
                          <Button>Atualizar senha</Button>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <h3 className="font-semibold mb-2">Sessões ativas</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">Chrome em Windows</p>
                              <p className="text-sm text-muted-foreground">São Paulo, Brasil • Agora</p>
                            </div>
                            <Button variant="outline" size="sm">Encerrar</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
