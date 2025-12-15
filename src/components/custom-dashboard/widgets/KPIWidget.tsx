import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useMultiAccountInsights } from '@/hooks/useMetaApi';
import { useDateRangeStore } from '@/stores/dateRangeStore';
import { useSelectedAccountsStore } from '@/stores/selectedAccountsStore';
import { useDashboardStore } from '@/stores/dashboardStore';
import {
  DollarSign,
  Eye,
  MousePointerClick,
  Users,
  Percent,
  MousePointer,
  BarChart3,
  Target,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Minus,
  Calculator,
} from 'lucide-react';
import type { Widget } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercentage, getConversions, parseMetricValue } from '@/lib/meta/utils';

interface KPIWidgetProps {
  widget: Widget;
}

const typeConfig: Record<string, {
  icon: React.ElementType;
  metric: string;
  format: 'currency' | 'number' | 'percentage';
  actionType?: string;
}> = {
  KPI_SPEND: { icon: DollarSign, metric: 'spend', format: 'currency' },
  KPI_IMPRESSIONS: { icon: Eye, metric: 'impressions', format: 'number' },
  KPI_CLICKS: { icon: MousePointerClick, metric: 'clicks', format: 'number' },
  KPI_REACH: { icon: Users, metric: 'reach', format: 'number' },
  KPI_CTR: { icon: Percent, metric: 'ctr', format: 'percentage' },
  KPI_CPC: { icon: MousePointer, metric: 'cpc', format: 'currency' },
  KPI_CPM: { icon: BarChart3, metric: 'cpm', format: 'currency' },
  KPI_CONVERSIONS: { icon: Target, metric: 'conversions', format: 'number', actionType: 'purchase' },
  KPI_CPA: { icon: ShoppingCart, metric: 'cpa', format: 'currency', actionType: 'purchase' },
  KPI_ROAS: { icon: TrendingUp, metric: 'roas', format: 'number' },
  KPI_COST_PER_CONVERSION: { icon: Calculator, metric: 'cost_per_conversion', format: 'currency', actionType: 'purchase' },
};

export function KPIWidget({ widget }: KPIWidgetProps) {
  const config = typeConfig[widget.type];
  const Icon = config?.icon || BarChart3;

  const { getTimeRange, getComparisonRange } = useDateRangeStore();
  const { selectedAccountIds } = useSelectedAccountsStore();
  const { currentDashboard } = useDashboardStore();

  // Para o widget de Custo por Conversão, herda o actionType do widget de Conversões
  const inheritedActionType = useMemo(() => {
    if (widget.type === 'KPI_COST_PER_CONVERSION') {
      const conversionsWidget = currentDashboard?.widgets?.find(
        (w) => w.type === 'KPI_CONVERSIONS'
      );
      return conversionsWidget?.config?.actionType;
    }
    return undefined;
  }, [widget.type, currentDashboard?.widgets]);

  const timeRange = getTimeRange();
  const comparisonRange = getComparisonRange();

  const accountIds = widget.config.accountIds?.length
    ? widget.config.accountIds
    : selectedAccountIds;

  const { data: currentData, isLoading: isLoadingCurrent } = useMultiAccountInsights(
    accountIds,
    timeRange,
    accountIds.length > 0
  );

  const { data: comparisonData, isLoading: isLoadingComparison } = useMultiAccountInsights(
    accountIds,
    comparisonRange,
    accountIds.length > 0 && widget.config.showComparison !== false
  );

  const isLoading = isLoadingCurrent || isLoadingComparison;

  const { currentValue, comparisonValue, change } = useMemo(() => {
    if (!currentData) return { currentValue: 0, comparisonValue: 0, change: 0 };

    let current = 0;
    let comparison = 0;

    const calculateValue = (insights: typeof currentData) => {
      let total = 0;
      let totalSpend = 0;
      let totalConversions = 0;
      let totalRevenue = 0;

      insights.forEach((item) => {
        if (!item.insights) return;

        const spend = parseMetricValue(item.insights.spend);
        totalSpend += spend;

        switch (config.metric) {
          case 'spend':
          case 'impressions':
          case 'clicks':
          case 'reach':
          case 'ctr':
          case 'cpc':
          case 'cpm': {
            const metricValue = item.insights[config.metric as 'spend' | 'impressions' | 'clicks' | 'reach' | 'ctr' | 'cpc' | 'cpm'];
            total += parseMetricValue(metricValue);
            break;
          }
          case 'conversions': {
            const actionType = widget.config.actionType || config.actionType;
            total += getConversions(item.insights.actions, actionType);
            break;
          }
          case 'cpa': {
            const actionType = widget.config.actionType || config.actionType || 'purchase';
            const conversions = getConversions(item.insights.actions, actionType);
            totalConversions += conversions;
            break;
          }
          case 'cost_per_conversion': {
            const actionType = inheritedActionType || widget.config.actionType || config.actionType || 'purchase';
            const conversions = getConversions(item.insights.actions, actionType);
            totalConversions += conversions;
            break;
          }
          case 'roas': {
            const revenue = getConversions(item.insights.action_values, 'purchase');
            totalRevenue += revenue;
            break;
          }
        }
      });

      if (config.metric === 'cpa' || config.metric === 'cost_per_conversion') {
        return totalConversions > 0 ? totalSpend / totalConversions : 0;
      }

      if (config.metric === 'roas') {
        return totalSpend > 0 ? totalRevenue / totalSpend : 0;
      }

      // For rate metrics, average instead of sum
      if (['ctr', 'cpc', 'cpm'].includes(config.metric)) {
        const validInsights = insights.filter((i) => i.insights);
        return validInsights.length > 0 ? total / validInsights.length : 0;
      }

      return total;
    };

    current = calculateValue(currentData);

    if (comparisonData) {
      comparison = calculateValue(comparisonData);
    }

    const changePercent = comparison > 0 ? ((current - comparison) / comparison) * 100 : 0;

    return { currentValue: current, comparisonValue: comparison, change: changePercent };
  }, [currentData, comparisonData, config, widget.config.actionType, inheritedActionType]);

  const formatValue = (value: number) => {
    switch (config.format) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return formatPercentage(value);
      default:
        return formatNumber(value);
    }
  };

  if (accountIds.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <p className="text-sm text-muted-foreground">Selecione pelo menos uma conta</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full flex-col justify-between">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
    );
  }

  const isPositive = change > 0;
  const isNeutral = change === 0;
  const isNegativeGood = ['cpc', 'cpm', 'cpa', 'cost_per_conversion'].includes(config.metric);

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-bold text-white">{formatValue(currentValue)}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#46CCC6]/10">
          <Icon className="h-5 w-5 text-[#46CCC6]" />
        </div>
      </div>

      {widget.config.showComparison !== false && comparisonValue > 0 && (
        <div className="flex items-center gap-1">
          {isNeutral ? (
            <Minus className="h-4 w-4 text-gray-400" />
          ) : isPositive === !isNegativeGood ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span
            className={
              isNeutral
                ? 'text-gray-400'
                : isPositive === !isNegativeGood
                ? 'text-green-500'
                : 'text-red-500'
            }
          >
            {change > 0 ? '+' : ''}
            {change.toFixed(1)}%
          </span>
          <span className="text-sm text-gray-400">vs período anterior</span>
        </div>
      )}
    </div>
  );
}
