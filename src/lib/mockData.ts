export const mockMetrics = {
  totalCampaigns: 12,
  monthlySpend: 15847.32,
  averageRoas: 4.2,
  insightsReceived: 47,
};

export const mockInsights = [
  {
    id: '1',
    date: '2025-10-08T14:30:00',
    summary: 'Campanha "Verão 2025" com CTR acima da média (+32%)',
    metrics: { ctr: 3.2, cpc: 0.87, roas: 5.1 },
    type: 'performance',
  },
  {
    id: '2',
    date: '2025-10-07T10:15:00',
    summary: 'Público "Jovens 18-25" respondendo bem ao criativo A',
    metrics: { ctr: 2.8, cpc: 1.12, roas: 4.3 },
    type: 'audience',
  },
  {
    id: '3',
    date: '2025-10-06T16:45:00',
    summary: 'Recomendação: Aumentar orçamento da campanha "Black Friday"',
    metrics: { ctr: 4.1, cpc: 0.65, roas: 6.8 },
    type: 'recommendation',
  },
  {
    id: '4',
    date: '2025-10-05T09:20:00',
    summary: 'Alerta: Campanha "Produto X" com queda de performance (-18%)',
    metrics: { ctr: 1.2, cpc: 2.34, roas: 1.9 },
    type: 'alert',
  },
  {
    id: '5',
    date: '2025-10-04T11:00:00',
    summary: 'Novo segmento "Mulheres 25-34" com alto potencial identificado',
    metrics: { ctr: 3.5, cpc: 0.95, roas: 5.4 },
    type: 'opportunity',
  },
];

export const mockPerformanceData = [
  { day: 'Seg', roas: 3.2, spend: 1847, revenue: 5910 },
  { day: 'Ter', roas: 4.1, spend: 2134, revenue: 8749 },
  { day: 'Qua', roas: 3.8, spend: 1965, revenue: 7467 },
  { day: 'Qui', roas: 4.5, spend: 2456, revenue: 11052 },
  { day: 'Sex', roas: 5.2, spend: 2789, revenue: 14502 },
  { day: 'Sáb', roas: 3.9, spend: 2012, revenue: 7846 },
  { day: 'Dom', roas: 3.5, spend: 1644, revenue: 5754 },
];

export const mockTimeline: Array<{
  id: string;
  type: 'insight' | 'connection' | 'alert';
  message: string;
  timestamp: string;
}> = [
  {
    id: '1',
    type: 'insight' as const,
    message: 'IA analisou 3 campanhas e enviou relatório via WhatsApp',
    timestamp: '2025-10-08T14:30:00',
  },
  {
    id: '2',
    type: 'connection' as const,
    message: 'Conta Meta Ads sincronizada com sucesso',
    timestamp: '2025-10-08T10:00:00',
  },
  {
    id: '3',
    type: 'insight' as const,
    message: 'Novo insight de performance enviado',
    timestamp: '2025-10-07T16:45:00',
  },
  {
    id: '4',
    type: 'alert' as const,
    message: 'Alerta: Orçamento de campanha próximo do limite',
    timestamp: '2025-10-07T09:15:00',
  },
  {
    id: '5',
    type: 'insight' as const,
    message: 'Análise semanal de ROAS concluída',
    timestamp: '2025-10-06T11:30:00',
  },
];

export const mockAdAccounts = [
  {
    id: 'act_123456789',
    name: 'Minha Empresa - Principal',
    currency: 'BRL',
    status: 'active',
  },
  {
    id: 'act_987654321',
    name: 'Minha Empresa - Teste',
    currency: 'BRL',
    status: 'active',
  },
  {
    id: 'act_456789123',
    name: 'Cliente XYZ',
    currency: 'BRL',
    status: 'active',
  },
];
