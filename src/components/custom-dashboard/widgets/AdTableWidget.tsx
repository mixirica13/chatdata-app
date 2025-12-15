import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAdInsights } from '@/hooks/useMetaApi';
import { useDateRangeStore } from '@/stores/dateRangeStore';
import { useSelectedAccountsStore } from '@/stores/selectedAccountsStore';
import type { Widget } from '@/types/dashboard';
import { formatCurrency, formatNumber, parseMetricValue } from '@/lib/meta/utils';

interface AdTableWidgetProps {
  widget: Widget;
}

export function AdTableWidget({ widget }: AdTableWidgetProps) {
  const { getTimeRange } = useDateRangeStore();
  const { selectedAccountIds } = useSelectedAccountsStore();
  const timeRange = getTimeRange();

  const accountIds = widget.config.accountIds?.length
    ? widget.config.accountIds
    : selectedAccountIds;

  const accountId = accountIds[0];

  const { data, isLoading } = useAdInsights(accountId || '', timeRange, !!accountId);

  if (accountIds.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Selecione pelo menos uma conta</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-2 p-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Nenhum anúncio encontrado</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="w-full">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-2 font-medium text-muted-foreground">Anúncio</th>
              <th className="pb-2 font-medium text-muted-foreground text-right">Gasto</th>
              <th className="pb-2 font-medium text-muted-foreground text-right">Impr.</th>
              <th className="pb-2 font-medium text-muted-foreground text-right">Cliques</th>
              <th className="pb-2 font-medium text-muted-foreground text-right">CTR</th>
            </tr>
          </thead>
          <tbody>
            {data.map((ad, index) => (
              <tr key={index} className="border-b border-border/50 hover:bg-muted/50">
                <td className="py-2 truncate max-w-[150px]" title={ad.ad_name}>
                  {ad.ad_name}
                </td>
                <td className="py-2 text-right">
                  {formatCurrency(parseMetricValue(ad.spend))}
                </td>
                <td className="py-2 text-right">
                  {formatNumber(parseMetricValue(ad.impressions))}
                </td>
                <td className="py-2 text-right">
                  {formatNumber(parseMetricValue(ad.clicks))}
                </td>
                <td className="py-2 text-right">
                  {parseMetricValue(ad.ctr).toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ScrollArea>
  );
}
