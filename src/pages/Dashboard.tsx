import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { MetricCard } from '@/components/MetricCard';
import { ConnectionCard } from '@/components/ConnectionCard';
import { InsightTimeline } from '@/components/InsightTimeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, DollarSign, Target, Zap, Facebook, MessageCircle } from 'lucide-react';
import { mockMetrics, mockPerformanceData, mockTimeline } from '@/lib/mockData';

const Dashboard = () => {
  const navigate = useNavigate();
  const { metaConnected, whatsappConnected, connectMeta, disconnectMeta, connectWhatsapp, disconnectWhatsapp } = useAuthStore();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          {/* Métricas rápidas */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total de Campanhas"
              value={mockMetrics.totalCampaigns}
              icon={Target}
              trend={{ value: '+2 este mês', positive: true }}
            />
            <MetricCard
              title="Gastos do Mês"
              value={`R$ ${mockMetrics.monthlySpend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              icon={DollarSign}
              trend={{ value: '+12%', positive: false }}
            />
            <MetricCard
              title="ROAS Médio"
              value={mockMetrics.averageRoas.toFixed(1)}
              icon={TrendingUp}
              trend={{ value: '+0.3', positive: true }}
            />
            <MetricCard
              title="Insights Recebidos"
              value={mockMetrics.insightsReceived}
              icon={Zap}
              trend={{ value: '+8 esta semana', positive: true }}
            />
          </div>

          {/* Status de conexões */}
          <div className="grid gap-4 md:grid-cols-2">
            <ConnectionCard
              title="Meta Ads"
              description="Conecte sua conta de anúncios do Facebook"
              icon={Facebook}
              connected={metaConnected}
              onConnect={() => navigate('/connect/meta')}
              onDisconnect={disconnectMeta}
            />
            <ConnectionCard
              title="WhatsApp"
              description="Receba insights diretamente no WhatsApp"
              icon={MessageCircle}
              connected={whatsappConnected}
              onConnect={() => navigate('/connect/whatsapp')}
              onDisconnect={disconnectWhatsapp}
            />
          </div>

          {/* Gráfico de performance */}
          <Card>
            <CardHeader>
              <CardTitle>Performance dos Últimos 7 Dias</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="roas" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Timeline de atividades */}
          <InsightTimeline items={mockTimeline} />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
