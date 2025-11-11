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
  TrendingUp,
  DollarSign,
  Eye,
  MousePointer,
  Target,
  AlertCircle,
  RefreshCw,
  Facebook,
  ChevronRight,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const MetaAdsDashboard = () => {
  const navigate = useNavigate();
  const { metaConnected } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use custom hook for Meta data
  const {
    adAccounts,
    selectedAccount,
    insights,
    isLoading,
    error,
    setSelectedAccount,
    refreshData
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
        {selectedAccount && (
          <LiquidGlass className="p-1">
            <div className="bg-gradient-to-br from-[#46CCC6]/20 to-[#46CCC6]/5 backdrop-blur-sm rounded-2xl p-4 border border-[#46CCC6]/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-[#46CCC6] rounded-full p-2">
                    <Facebook className="h-5 w-5 text-black" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {selectedAccount.name}
                    </h2>
                    <p className="text-sm text-gray-400">
                      ID: {selectedAccount.account_id}
                    </p>
                  </div>
                </div>
                {adAccounts.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#46CCC6] hover:bg-[#46CCC6]/10"
                  >
                    Trocar
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
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
                {insights.date_start && insights.date_stop && (
                  <span className="text-sm text-gray-400 ml-2">
                    ({new Date(insights.date_start).toLocaleDateString('pt-BR')} - {new Date(insights.date_stop).toLocaleDateString('pt-BR')})
                  </span>
                )}
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

            {/* Account Balance */}
            {selectedAccount?.balance && (
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
