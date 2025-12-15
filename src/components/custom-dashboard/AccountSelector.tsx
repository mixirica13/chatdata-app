import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAdAccounts, useActiveAdAccounts, useSaveAdAccounts } from '@/hooks/useMetaApi';
import { useSelectedAccountsStore } from '@/stores/selectedAccountsStore';
import { Building2, ChevronDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function AccountSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedAccountIds, setSelectedAccounts, toggleAccount, selectAll, clearAll } = useSelectedAccountsStore();

  // Busca todas as contas disponíveis da Meta
  const { data: metaAccounts, isLoading: isLoadingMeta } = useAdAccounts();

  // Busca contas salvas pelo usuário
  const { data: savedAccounts, isLoading: isLoadingSaved } = useActiveAdAccounts();

  const saveAccountsMutation = useSaveAdAccounts();

  // Sincroniza contas salvas com a seleção
  useEffect(() => {
    if (savedAccounts && savedAccounts.length > 0 && selectedAccountIds.length === 0) {
      setSelectedAccounts(savedAccounts.map(acc => acc.account_id));
    }
  }, [savedAccounts, selectedAccountIds.length, setSelectedAccounts]);

  const handleSave = () => {
    if (!metaAccounts) return;

    const accountsToSave = metaAccounts
      .filter(acc => selectedAccountIds.includes(acc.id))
      .map(acc => ({
        account_id: acc.id,
        account_name: acc.name,
        currency: acc.currency,
      }));

    saveAccountsMutation.mutate(accountsToSave, {
      onSuccess: () => {
        toast.success('Contas salvas!');
        setIsOpen(false);
      },
      onError: () => {
        toast.error('Erro ao salvar contas');
      },
    });
  };

  const isLoading = isLoadingMeta || isLoadingSaved;

  const getLabel = () => {
    if (selectedAccountIds.length === 0) return 'Selecionar contas';
    if (selectedAccountIds.length === 1 && metaAccounts) {
      const account = metaAccounts.find(acc => acc.id === selectedAccountIds[0]);
      return account?.name || '1 conta';
    }
    return `${selectedAccountIds.length} contas`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[200px] justify-between text-left font-normal bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-[#46CCC6]" />
            <span className="truncate">{getLabel()}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 bg-black border-white/10" align="start">
        <div className="p-3 border-b border-white/10">
          <h4 className="text-sm font-medium text-white">Contas de Anúncios</h4>
          <p className="text-xs text-gray-400 mt-1">
            Selecione as contas para visualizar no dashboard
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#46CCC6]" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-[#46CCC6] hover:text-[#46CCC6] hover:bg-[#46CCC6]/10"
                onClick={() => selectAll(metaAccounts?.map(acc => acc.id) || [])}
              >
                Selecionar todas
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-400 hover:text-white hover:bg-white/10"
                onClick={clearAll}
              >
                Limpar
              </Button>
            </div>

            <ScrollArea className="h-[200px]">
              <div className="p-2">
                {metaAccounts?.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer"
                    onClick={() => toggleAccount(account.id)}
                  >
                    <Checkbox
                      checked={selectedAccountIds.includes(account.id)}
                      className="border-white/30 data-[state=checked]:bg-[#46CCC6] data-[state=checked]:border-[#46CCC6]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{account.name}</p>
                      <p className="text-xs text-gray-400">{account.id}</p>
                    </div>
                    <span className="text-xs text-gray-400">{account.currency}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-3 border-t border-white/10">
              <Button
                className="w-full bg-[#46CCC6] text-black hover:bg-[#46CCC6]/90"
                onClick={handleSave}
                disabled={saveAccountsMutation.isPending}
              >
                {saveAccountsMutation.isPending ? 'Salvando...' : 'Salvar Seleção'}
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
