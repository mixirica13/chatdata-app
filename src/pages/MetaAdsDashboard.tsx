import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMetaData } from '@/hooks/useMetaData';
import { BottomNav } from '@/components/BottomNav';
import { Logo } from '@/components/Logo';
import { LiquidGlass } from '@/components/LiquidGlass';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp,
  DollarSign,
  Eye,
  MousePointer,
  Target,
  AlertCircle,
  RefreshCw,
  Facebook,
  ChevronRight,
  Activity,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const MetaAdsDashboard = () => {
  const navigate = useNavigate();
  const { metaConnected } = useAuth();
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [selectedPreset, setSelectedPreset] = useState<string>('auto');

  // Use custom hook for Meta data
  const {
    adAccounts,
    selectedAccount,
    insights,
    isLoading,
    error,
    setSelectedAccount,
    refreshData,
    fetchInsightsWithDateRange
  } = useMetaData();

  // Redirect if not connected
  useEffect(() => {
    if (!metaConnected) {
      toast.error('Conecte sua conta Meta Ads primeiro');
      navigate('/dashboard');
    }
  }, [metaConnected, navigate]);

  // Show error toast if any
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
    toast.success('Dados atualizados!');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    setCustomDateRange({ from: undefined, to: undefined });

    if (preset !== 'auto' && preset !== 'custom') {
      const today = new Date();
      const end = format(today, 'yyyy-MM-dd');
      let start = '';

      switch (preset) {
        case 'today':
          start = end;
          break;
        case 'yesterday':
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          start = format(yesterday, 'yyyy-MM-dd');
          break;
        case 'last_7d':
          const last7 = new Date(today);
          last7.setDate(last7.getDate() - 7);
          start = format(last7, 'yyyy-MM-dd');
          break;
        case 'last_14d':
          const last14 = new Date(today);
          last14.setDate(last14.getDate() - 14);
          start = format(last14, 'yyyy-MM-dd');
          break;
        case 'last_30d':
          const last30 = new Date(today);
          last30.setDate(last30.getDate() - 30);
          start = format(last30, 'yyyy-MM-dd');
          break;
        case 'last_90d':
          const last90 = new Date(today);
          last90.setDate(last90.getDate() - 90);
          start = format(last90, 'yyyy-MM-dd');
          break;
        case 'this_month':
          start = format(new Date(today.getFullYear(), today.getMonth(), 1), 'yyyy-MM-dd');
          break;
        case 'last_month':
          const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
          start = format(lastMonth, 'yyyy-MM-dd');
          fetchInsightsWithDateRange(start, format(lastMonthEnd, 'yyyy-MM-dd'));
          return;
      }

      fetchInsightsWithDateRange(start, end);
    }
  };

  const handleCustomDateApply = () => {
    if (customDateRange.from && customDateRange.to) {
      const start = format(customDateRange.from, 'yyyy-MM-dd');
      const end = format(customDateRange.to, 'yyyy-MM-dd');
      fetchInsightsWithDateRange(start, end);
      setDateRangeOpen(false);
      toast.success('Período personalizado aplicado');
    } else {
      toast.error('Selecione uma data de início e fim');
    }
  };

  const getDateRangeLabel = () => {
    if (selectedPreset === 'custom' && customDateRange.from && customDateRange.to) {
      return `${format(customDateRange.from, 'dd/MM/yyyy', { locale: ptBR })} - ${format(customDateRange.to, 'dd/MM/yyyy', { locale: ptBR })}`;
    }

    const presetLabels: Record<string, string> = {
      auto: 'Automático',
      today: 'Hoje',
      yesterday: 'Ontem',
      last_7d: 'Últimos 7 dias',
      last_14d: 'Últimos 14 dias',
      last_30d: 'Últimos 30 dias',
      last_90d: 'Últimos 90 dias',
      this_month: 'Este mês',
      last_month: 'Mês passado',
    };

    return presetLabels[selectedPreset] || 'Selecionar período';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-black flex flex-col p-4 pb-32">
        <div className="w-full flex justify-center pt-0 pb-4">
          <Logo className="h-12 w-auto md:h-16" />
        </div>
        <div className="flex-1 space-y-4 max-w-7xl mx-auto w-full">
          <Skeleton className="h-32 w-full rounded-2xl bg-white/5" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-24 w-full rounded-xl bg-white/5" />
            <Skeleton className="h-24 w-full rounded-xl bg-white/5" />
            <Skeleton className="h-24 w-full rounded-xl bg-white/5" />
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black flex flex-col p-4 pb-32">
      {/* Header */}
      <div className="w-full flex justify-between items-center pt-0 pb-4">
        <Logo className="h-12 w-auto md:h-16" />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="text-white hover:text-[#46CCC6] hover:bg-white/5"
        >
          <RefreshCw className={cn('h-5 w-5', isRefreshing && 'animate-spin')} />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-4 max-w-7xl mx-auto w-full">
        {/* Account Selector */}
        {adAccounts.length > 0 && selectedAccount && (
          <LiquidGlass className="p-1">
            <div className="bg-gradient-to-br from-[#46CCC6]/20 to-[#46CCC6]/5 backdrop-blur-sm rounded-2xl p-4 border border-[#46CCC6]/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-[#46CCC6] rounded-full p-2">
                  <Facebook className="h-5 w-5 text-black" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-1">Conta de Anúncios</p>
                  {adAccounts.length > 1 ? (
                    <Select
                      value={selectedAccount.id}
                      onValueChange={(value) => {
                        const account = adAccounts.find(acc => acc.id === value);
                        if (account) setSelectedAccount(account);
                      }}
                    >
                      <SelectTrigger className="bg-black/40 border-white/10 text-white h-auto py-2">
                        <SelectValue>
                          <div className="text-left">
                            <p className="font-bold">{selectedAccount.name}</p>
                            <p className="text-xs text-gray-400">ID: {selectedAccount.account_id}</p>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-black border-white/10">
                        {adAccounts.map((account) => (
                          <SelectItem
                            key={account.id}
                            value={account.id}
                            className="text-white hover:bg-white/10 focus:bg-white/10"
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{account.name}</span>
                              <span className="text-xs text-gray-400">ID: {account.account_id}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div>
                      <h2 className="text-lg font-bold text-white">
                        {selectedAccount.name}
                      </h2>
                      <p className="text-sm text-gray-400">
                        ID: {selectedAccount.account_id}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {selectedAccount.business && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-xs text-gray-400">
                    Business: <span className="text-white">{selectedAccount.business.name}</span>
                  </p>
                </div>
              )}
            </div>
          </LiquidGlass>
        )}

        {/* Date Range Picker */}
        {adAccounts.length > 0 && selectedAccount && (
          <LiquidGlass className="p-1">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 rounded-full p-2">
                  <Calendar className="h-5 w-5 text-[#46CCC6]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-1">Período</p>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-black/40 border-white/10 text-white hover:bg-white/10 hover:text-white"
                    onClick={() => setDateRangeOpen(true)}
                  >
                    {getDateRangeLabel()}
                  </Button>

                  {/* Mobile: Dialog */}
                  {isMobile ? (
                    <Dialog open={dateRangeOpen} onOpenChange={setDateRangeOpen}>
                      <DialogContent className="bg-black border-white/10 max-w-[90vw]">
                        <DialogHeader>
                          <DialogTitle className="text-white">Selecionar Período</DialogTitle>
                        </DialogHeader>
                      <div className="flex flex-col sm:flex-row">
                        {/* Presets */}
                        <div className="border-b sm:border-b-0 sm:border-r border-white/10 p-3">
                          <div className="space-y-1">
                            {[
                              { value: 'custom', label: 'Personalizado' },
                              { value: 'auto', label: 'Automático' },
                              { value: 'today', label: 'Hoje' },
                              { value: 'yesterday', label: 'Ontem' },
                              { value: 'last_7d', label: 'Últimos 7 dias' },
                              { value: 'last_14d', label: 'Últimos 14 dias' },
                              { value: 'last_30d', label: 'Últimos 30 dias' },
                              { value: 'last_90d', label: 'Últimos 90 dias' },
                              { value: 'this_month', label: 'Este mês' },
                              { value: 'last_month', label: 'Mês passado' },
                            ].map((preset) => (
                              <Button
                                key={preset.value}
                                variant="ghost"
                                className={cn(
                                  'w-full justify-start text-sm text-white hover:bg-white/10',
                                  selectedPreset === preset.value && 'bg-[#46CCC6]/20 text-[#46CCC6]'
                                )}
                                onClick={() => {
                                  if (preset.value === 'custom') {
                                    setSelectedPreset('custom');
                                  } else {
                                    handlePresetChange(preset.value);
                                    if (preset.value !== 'auto') {
                                      setDateRangeOpen(false);
                                    }
                                  }
                                }}
                              >
                                {preset.label}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Custom Date Range Calendar */}
                        {selectedPreset === 'custom' && (
                          <div className="p-3">
                            <CalendarComponent
                              mode="range"
                              selected={customDateRange as any}
                              onSelect={(range: any) => setCustomDateRange(range || { from: undefined, to: undefined })}
                              numberOfMonths={1}
                              locale={ptBR}
                              className="text-white"
                              modifiers={{
                                selected: customDateRange.from || customDateRange.to ? false : undefined,
                              }}
                              modifiersClassNames={{
                                selected: 'bg-[#46CCC6] text-black hover:bg-[#46CCC6]/90',
                                range_middle: 'bg-[#46CCC6]/20 text-white',
                                range_start: 'bg-[#46CCC6] text-black',
                                range_end: 'bg-[#46CCC6] text-black',
                                today: customDateRange.from || customDateRange.to ? 'bg-transparent text-white font-bold' : 'bg-white/10 text-white',
                              }}
                            />
                            <div className="mt-3 space-y-2">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
                                  onClick={() => setDateRangeOpen(false)}
                                >
                                  Fechar
                                </Button>
                                <Button
                                  size="sm"
                                  className="flex-1 bg-[#46CCC6] text-black hover:bg-[#46CCC6]/90"
                                  onClick={handleCustomDateApply}
                                >
                                  Aplicar
                                </Button>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                                onClick={() => {
                                  setCustomDateRange({ from: undefined, to: undefined });
                                  toast.success('Calendário limpo');
                                }}
                              >
                                Limpar Calendário
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  /* Desktop: Popover */
                  <Popover open={dateRangeOpen} onOpenChange={setDateRangeOpen}>
                    <PopoverTrigger className="hidden" />
                    <PopoverContent className="w-auto p-0 bg-black border-white/10" align="start">
                      <div className="flex flex-col sm:flex-row">
                        {/* Presets */}
                        <div className="border-b sm:border-b-0 sm:border-r border-white/10 p-3">
                          <div className="space-y-1">
                            {[
                              { value: 'custom', label: 'Personalizado' },
                              { value: 'auto', label: 'Automático' },
                              { value: 'today', label: 'Hoje' },
                              { value: 'yesterday', label: 'Ontem' },
                              { value: 'last_7d', label: 'Últimos 7 dias' },
                              { value: 'last_14d', label: 'Últimos 14 dias' },
                              { value: 'last_30d', label: 'Últimos 30 dias' },
                              { value: 'last_90d', label: 'Últimos 90 dias' },
                              { value: 'this_month', label: 'Este mês' },
                              { value: 'last_month', label: 'Mês passado' },
                            ].map((preset) => (
                              <Button
                                key={preset.value}
                                variant="ghost"
                                className={cn(
                                  'w-full justify-start text-sm text-white hover:bg-white/10',
                                  selectedPreset === preset.value && 'bg-[#46CCC6]/20 text-[#46CCC6]'
                                )}
                                onClick={() => {
                                  if (preset.value === 'custom') {
                                    setSelectedPreset('custom');
                                  } else {
                                    handlePresetChange(preset.value);
                                    if (preset.value !== 'auto') {
                                      setDateRangeOpen(false);
                                    }
                                  }
                                }}
                              >
                                {preset.label}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Custom Date Range Calendar */}
                        {selectedPreset === 'custom' && (
                          <div className="p-3">
                            <CalendarComponent
                              mode="range"
                              selected={customDateRange as any}
                              onSelect={(range: any) => setCustomDateRange(range || { from: undefined, to: undefined })}
                              numberOfMonths={1}
                              locale={ptBR}
                              className="text-white"
                              modifiers={{
                                selected: customDateRange.from || customDateRange.to ? false : undefined,
                              }}
                              modifiersClassNames={{
                                selected: 'bg-[#46CCC6] text-black hover:bg-[#46CCC6]/90',
                                range_middle: 'bg-[#46CCC6]/20 text-white',
                                range_start: 'bg-[#46CCC6] text-black',
                                range_end: 'bg-[#46CCC6] text-black',
                                today: customDateRange.from || customDateRange.to ? 'bg-transparent text-white font-bold' : 'bg-white/10 text-white',
                              }}
                            />
                            <div className="mt-3 space-y-2">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
                                  onClick={() => setDateRangeOpen(false)}
                                >
                                  Fechar
                                </Button>
                                <Button
                                  size="sm"
                                  className="flex-1 bg-[#46CCC6] text-black hover:bg-[#46CCC6]/90"
                                  onClick={handleCustomDateApply}
                                >
                                  Aplicar
                                </Button>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                                onClick={() => {
                                  setCustomDateRange({ from: undefined, to: undefined });
                                  toast.success('Calendário limpo');
                                }}
                              >
                                Limpar Calendário
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
                </div>
              </div>
            </div>
          </LiquidGlass>
        )}

        {/* No accounts */}
        {adAccounts.length === 0 && (
          <LiquidGlass className="p-1">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 text-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                Nenhuma conta encontrada
              </h3>
              <p className="text-gray-400 mb-6">
                Não encontramos contas de anúncios conectadas. Verifique suas permissões no Business Manager.
              </p>
              <Button
                onClick={() => navigate('/connect/meta')}
                className="bg-[#46CCC6] hover:bg-[#46CCC6]/90 text-black"
              >
                Reconectar Meta Ads
              </Button>
            </div>
          </LiquidGlass>
        )}

        {/* Metrics Grid */}
        {insights && (
          <>
            {/* Campaign/Account Name */}
            <div className="flex items-center gap-2 text-white px-1">
              <Activity className="h-5 w-5 text-[#46CCC6]" />
              <h3 className="text-lg font-semibold">
                {insights.campaign_name}
              </h3>
            </div>

            {/* Primary Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Impressions */}
              <LiquidGlass className="p-1">
                <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-300">Impressões</p>
                      <div className="bg-purple-500/20 p-2 rounded-lg">
                        <Eye className="h-4 w-4 text-purple-400" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      {formatNumber(insights.impressions)}
                    </h3>
                  </CardContent>
                </Card>
              </LiquidGlass>

              {/* Clicks */}
              <LiquidGlass className="p-1">
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-300">Cliques</p>
                      <div className="bg-blue-500/20 p-2 rounded-lg">
                        <MousePointer className="h-4 w-4 text-blue-400" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      {formatNumber(insights.clicks)}
                    </h3>
                  </CardContent>
                </Card>
              </LiquidGlass>

              {/* Spend */}
              <LiquidGlass className="p-1">
                <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-300">Investimento</p>
                      <div className="bg-green-500/20 p-2 rounded-lg">
                        <DollarSign className="h-4 w-4 text-green-400" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      {formatCurrency(insights.spend)}
                    </h3>
                  </CardContent>
                </Card>
              </LiquidGlass>

              {/* CTR */}
              <LiquidGlass className="p-1">
                <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-300">CTR</p>
                      <div className="bg-yellow-500/20 p-2 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-yellow-400" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      {insights.ctr.toFixed(2)}%
                    </h3>
                  </CardContent>
                </Card>
              </LiquidGlass>

              {/* CPC */}
              <LiquidGlass className="p-1">
                <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-300">CPC</p>
                      <div className="bg-orange-500/20 p-2 rounded-lg">
                        <DollarSign className="h-4 w-4 text-orange-400" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      {formatCurrency(insights.cpc)}
                    </h3>
                  </CardContent>
                </Card>
              </LiquidGlass>

              {/* Reach */}
              <LiquidGlass className="p-1">
                <Card className="bg-gradient-to-br from-[#46CCC6]/10 to-[#46CCC6]/5 border-[#46CCC6]/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-300">Alcance</p>
                      <div className="bg-[#46CCC6]/20 p-2 rounded-lg">
                        <Target className="h-4 w-4 text-[#46CCC6]" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      {formatNumber(insights.reach)}
                    </h3>
                  </CardContent>
                </Card>
              </LiquidGlass>
            </div>

            {/* Account Balance - Hidden for now */}
            {false && selectedAccount?.balance && (
              <LiquidGlass className="p-1">
                <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-[#46CCC6]" />
                      Saldo da Conta
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-white">
                          {formatCurrency(parseFloat(selectedAccount.balance))}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Total gasto: {formatCurrency(parseFloat(selectedAccount.amount_spent || '0'))}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </LiquidGlass>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default MetaAdsDashboard;
