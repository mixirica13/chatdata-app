import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDefaultDashboard, useActiveAdAccounts, useMetaAccessToken } from '@/hooks/useMetaApi';
import { useDashboardStore } from '@/stores/dashboardStore';
import { useSelectedAccountsStore } from '@/stores/selectedAccountsStore';
import { DashboardGrid, DateRangePicker, AccountSelector } from '@/components/custom-dashboard';
import { BottomNav } from '@/components/BottomNav';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Loader2, Key, AlertCircle, RefreshCw, ArrowLeft, Facebook } from 'lucide-react';
import { toast } from 'sonner';
import type { Dashboard } from '@/types/dashboard';

const CustomDashboard = () => {
  const navigate = useNavigate();
  const { metaConnected } = useAuth();
  const { setCurrentDashboard } = useDashboardStore();
  const { selectedAccountIds, setSelectedAccounts } = useSelectedAccountsStore();

  // Check token status
  const { isLoadingToken, tokenError } = useMetaAccessToken();

  // Fetch dashboard and accounts
  const { data: defaultDashboard, isLoading: isLoadingDashboard, refetch: refetchDashboard } = useDefaultDashboard();
  const { data: accounts, isLoading: isLoadingAccounts } = useActiveAdAccounts();

  // Set current dashboard when loaded
  useEffect(() => {
    if (defaultDashboard) {
      setCurrentDashboard(defaultDashboard as Dashboard);
    }
  }, [defaultDashboard, setCurrentDashboard]);

  // Select accounts when loaded
  useEffect(() => {
    if (accounts && Array.isArray(accounts) && accounts.length > 0 && selectedAccountIds.length === 0) {
      setSelectedAccounts(accounts.map((a) => a.account_id));
    }
  }, [accounts, selectedAccountIds.length, setSelectedAccounts]);

  const isLoading = isLoadingToken || isLoadingDashboard || isLoadingAccounts;

  const handleRefresh = () => {
    refetchDashboard();
    toast.success('Dashboard updated!');
  };

  // Not connected to Meta state
  if (!metaConnected) {
    return (
      <div className="min-h-screen w-full bg-black flex flex-col p-6 pb-32">
        <div className="w-full flex items-center justify-center pt-0 pb-4">
          <Logo className="h-12 w-auto" />
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#46CCC6]/10">
              <Facebook className="h-8 w-8 text-[#46CCC6]" />
            </div>
            <h2 className="text-2xl font-bold text-white">CONNECT META ADS</h2>
            <p className="max-w-md text-gray-400">
              To view your custom dashboard, connect your Meta Ads account first.
            </p>
            <Button
              onClick={() => navigate('/connect/meta')}
              className="bg-[#46CCC6] text-black hover:bg-[#46CCC6]/90"
            >
              Connect Meta Ads
            </Button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-black flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-[#46CCC6] mx-auto mb-4" />
            <p className="text-gray-400">Loading dashboard...</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // Token error state
  if (tokenError) {
    return (
      <div className="min-h-screen w-full bg-black flex flex-col p-6 pb-32">
        <div className="w-full flex items-center justify-between pt-0 pb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Logo className="h-12 w-auto" />
          <div className="w-10" />
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#46CCC6]/10">
              <Key className="h-8 w-8 text-[#46CCC6]" />
            </div>
            <h2 className="text-2xl font-bold text-white">CONFIGURE YOUR TOKEN</h2>
            <p className="max-w-md text-gray-400">
              {tokenError}
            </p>
            <Button
              onClick={() => navigate('/connect/meta')}
              className="bg-[#46CCC6] text-black hover:bg-[#46CCC6]/90"
            >
              Reconnect Meta Ads
            </Button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // No accounts state
  if (!accounts || accounts.length === 0) {
    return (
      <div className="min-h-screen w-full bg-black flex flex-col p-6 pb-32">
        <div className="w-full flex items-center justify-between pt-0 pb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Logo className="h-12 w-auto" />
          <div className="w-10" />
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">SELECT YOUR ACCOUNTS</h2>
            <p className="max-w-md text-gray-400">
              No ad accounts selected. Use the account selector to choose
              which accounts you want to monitor.
            </p>
            <AccountSelector />
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black flex flex-col pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/90 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Logo className="h-8 w-auto" />
          </div>

          <div className="flex items-center gap-2">
            <DateRangePicker />
            <AccountSelector />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              className="text-white hover:bg-white/10"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="flex-1">
        <DashboardGrid />
      </div>

      <BottomNav />
    </div>
  );
};

export default CustomDashboard;
