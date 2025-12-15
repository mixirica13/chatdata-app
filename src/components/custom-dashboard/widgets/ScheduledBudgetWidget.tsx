import { Skeleton } from '@/components/ui/skeleton';
import { useMultiAccountBudgets } from '@/hooks/useMetaApi';
import { useSelectedAccountsStore } from '@/stores/selectedAccountsStore';
import type { Widget } from '@/types/dashboard';
import { formatCurrency } from '@/lib/meta/utils';
import { CalendarClock } from 'lucide-react';

interface ScheduledBudgetWidgetProps {
  widget: Widget;
}

export function ScheduledBudgetWidget({ widget }: ScheduledBudgetWidgetProps) {
  const { selectedAccountIds } = useSelectedAccountsStore();

  const accountIds = widget.config.accountIds?.length
    ? widget.config.accountIds
    : selectedAccountIds;

  const { data, isLoading } = useMultiAccountBudgets(accountIds, accountIds.length > 0);

  if (accountIds.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
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

  const totalDailyBudget = data?.reduce((sum, item) => sum + (item.totalDailyBudget || 0), 0) || 0;
  const totalCBO = data?.reduce((sum, item) => sum + (item.cboBudget || 0), 0) || 0;
  const totalABO = data?.reduce((sum, item) => sum + (item.aboBudget || 0), 0) || 0;

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-bold">
            {formatCurrency(totalDailyBudget)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            orçamento diário
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <CalendarClock className="h-5 w-5 text-primary" />
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>CBO: {formatCurrency(totalCBO)}</span>
        <span>ABO: {formatCurrency(totalABO)}</span>
      </div>
    </div>
  );
}
