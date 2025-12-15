import { Skeleton } from '@/components/ui/skeleton';
import { useMultiAccountBalances } from '@/hooks/useMetaApi';
import { useSelectedAccountsStore } from '@/stores/selectedAccountsStore';
import type { Widget } from '@/types/dashboard';
import { formatCurrency } from '@/lib/meta/utils';
import { Wallet } from 'lucide-react';

interface AccountBalanceWidgetProps {
  widget: Widget;
}

export function AccountBalanceWidget({ widget }: AccountBalanceWidgetProps) {
  const { selectedAccountIds } = useSelectedAccountsStore();

  const accountIds = widget.config.accountIds?.length
    ? widget.config.accountIds
    : selectedAccountIds;

  const { data, isLoading } = useMultiAccountBalances(accountIds, accountIds.length > 0);

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

  const totalBalance = data?.reduce((sum, item) => sum + (item.balance || 0), 0) || 0;

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-bold">
            {formatCurrency(totalBalance)}
          </p>
          {data && data.length > 1 && (
            <p className="text-sm text-muted-foreground mt-1">
              {data.length} contas
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Wallet className="h-5 w-5 text-primary" />
        </div>
      </div>

      {data && data.some(item => item.displayString) && (
        <div className="mt-2">
          {data
            .filter(item => item.displayString)
            .slice(0, 2)
            .map((item, index) => (
              <p key={index} className="text-xs text-muted-foreground truncate">
                {item.displayString}
              </p>
            ))}
        </div>
      )}
    </div>
  );
}
