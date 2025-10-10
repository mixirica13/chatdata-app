import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { MetricCard } from '@/components/MetricCard';
import { InsightTimeline } from '@/components/InsightTimeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Target, Zap, Crown, AlertCircle } from 'lucide-react';
import { mockMetrics, mockPerformanceData, mockTimeline } from '@/lib/mockData';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isSubscribed, subscriptionEnd } = useAuth();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          {/* Status da assinatura */}
          {isSubscribed && subscriptionEnd && (
            <Alert>
              <Crown className="h-4 w-4" />
              <AlertTitle>Plano Premium Ativo</AlertTitle>
              <AlertDescription>
                Sua assinatura está ativa até {new Date(subscriptionEnd).toLocaleDateString('pt-BR')}
              </AlertDescription>
            </Alert>
          )}

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
