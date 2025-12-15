import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useInsightsWithTimeIncrement, useCampaignInsights } from '@/hooks/useMetaApi';
import { useDateRangeStore } from '@/stores/dateRangeStore';
import { useSelectedAccountsStore } from '@/stores/selectedAccountsStore';
import type { Widget } from '@/types/dashboard';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChartWidgetProps {
  widget: Widget;
}

const COLORS = ['#46CCC6', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981', '#3B82F6'];

// Helper para obter conversões de actions
function getConversions(actions: Array<{ action_type: string; value: string }> | undefined, actionType: string): number {
  if (!actions) return 0;
  const action = actions.find((a) => a.action_type === actionType);
  return action ? parseInt(action.value) || 0 : 0;
}

// Helper para obter valores de conversões
function getConversionValue(actionValues: Array<{ action_type: string; value: string }> | undefined, actionType: string): number {
  if (!actionValues) return 0;
  const action = actionValues.find((a) => a.action_type === actionType);
  return action ? parseFloat(action.value) || 0 : 0;
}

// Labels para as métricas
const METRIC_LABELS: Record<string, string> = {
  spend: 'Gasto',
  impressions: 'Impressões',
  clicks: 'Cliques',
  reach: 'Alcance',
  ctr: 'CTR',
  cpc: 'CPC',
  cpm: 'CPM',
  conversions: 'Conversões',
  cost_per_conversion: 'Custo/Conversão',
  roas: 'ROAS',
};

export function ChartWidget({ widget }: ChartWidgetProps) {
  const { getTimeRange } = useDateRangeStore();
  const { selectedAccountIds } = useSelectedAccountsStore();
  const timeRange = getTimeRange();

  const accountIds = widget.config.accountIds?.length
    ? widget.config.accountIds
    : selectedAccountIds;

  const accountId = accountIds[0] || '';

  // Para gráficos de linha, busca dados com incremento de tempo
  const { data: timeSeriesData, isLoading: isLoadingTimeSeries } = useInsightsWithTimeIncrement(
    accountId,
    timeRange,
    1, // daily
    widget.type === 'CHART_LINE' && !!accountId
  );

  // Para gráficos de barra e pizza, busca dados de campanhas
  const { data: campaignData, isLoading: isLoadingCampaigns } = useCampaignInsights(
    accountId,
    timeRange,
    (widget.type === 'CHART_BAR' || widget.type === 'CHART_PIE') && !!accountId
  );

  const isLoading = isLoadingTimeSeries || isLoadingCampaigns;

  const actionType = widget.config.actionType || 'purchase';
  const metric = widget.config.metric || 'spend';
  const metricLabel = METRIC_LABELS[metric] || metric;

  const chartData = useMemo(() => {
    if (widget.type === 'CHART_LINE' && timeSeriesData) {
      return timeSeriesData.map((item) => {
        const spend = parseFloat(item.spend) || 0;
        const impressions = parseInt(item.impressions) || 0;
        const clicks = parseInt(item.clicks) || 0;
        const reach = parseInt(item.reach) || 0;
        const conversions = getConversions(item.actions, actionType);
        const conversionValue = getConversionValue(item.action_values, actionType);

        return {
          date: format(parseISO(item.date_start), 'dd/MM', { locale: ptBR }),
          spend,
          impressions,
          clicks,
          reach,
          ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
          cpc: clicks > 0 ? spend / clicks : 0,
          cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
          conversions,
          cost_per_conversion: conversions > 0 ? spend / conversions : 0,
          roas: spend > 0 ? conversionValue / spend : 0,
        };
      });
    }

    if ((widget.type === 'CHART_BAR' || widget.type === 'CHART_PIE') && campaignData) {
      return campaignData
        .map((item) => {
          const spend = parseFloat(item.spend) || 0;
          const impressions = parseInt(item.impressions) || 0;
          const clicks = parseInt(item.clicks) || 0;
          const reach = parseInt(item.reach) || 0;
          const conversions = getConversions(item.actions, actionType);
          const conversionValue = getConversionValue(item.action_values, actionType);

          return {
            name: item.campaign_name?.slice(0, 20) || 'Sem nome',
            spend,
            impressions,
            clicks,
            reach,
            ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
            cpc: clicks > 0 ? spend / clicks : 0,
            cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
            conversions,
            cost_per_conversion: conversions > 0 ? spend / conversions : 0,
            roas: spend > 0 ? conversionValue / spend : 0,
          };
        })
        .sort((a, b) => b.spend - a.spend)
        .slice(0, 10);
    }

    return [];
  }, [widget.type, timeSeriesData, campaignData, actionType]);

  // Formatador de valores para tooltip
  const formatTooltipValue = (value: number): string => {
    switch (metric) {
      case 'spend':
      case 'cpc':
      case 'cpm':
      case 'cost_per_conversion':
        return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'ctr':
        return `${value.toFixed(2)}%`;
      case 'roas':
        return `${value.toFixed(2)}x`;
      case 'impressions':
      case 'clicks':
      case 'reach':
      case 'conversions':
        return value.toLocaleString('pt-BR');
      default:
        return value.toLocaleString('pt-BR');
    }
  };

  // Formatador de eixo Y
  const formatYAxis = (value: number): string => {
    switch (metric) {
      case 'spend':
      case 'cpc':
      case 'cpm':
      case 'cost_per_conversion':
        if (value >= 1000) return `R$${(value / 1000).toFixed(0)}k`;
        return `R$${value.toFixed(0)}`;
      case 'ctr':
        return `${value.toFixed(1)}%`;
      case 'roas':
        return `${value.toFixed(1)}x`;
      case 'impressions':
      case 'clicks':
      case 'reach':
      case 'conversions':
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
        return value.toString();
      default:
        if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
        return value.toString();
    }
  };

  if (accountIds.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Selecione pelo menos uma conta</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Sem dados para exibir</p>
      </div>
    );
  }

  if (widget.type === 'CHART_LINE') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#999', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: '#999', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatYAxis}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [formatTooltipValue(value), metricLabel]}
          />
          <Line
            type="monotone"
            dataKey={metric}
            stroke="#46CCC6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (widget.type === 'CHART_BAR') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#999', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tick={{ fill: '#999', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatYAxis}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [formatTooltipValue(value), metricLabel]}
          />
          <Bar dataKey={metric} fill="#46CCC6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (widget.type === 'CHART_PIE') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey={metric}
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={2}
            label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
            labelLine={false}
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [formatTooltipValue(value), metricLabel]}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return null;
}
