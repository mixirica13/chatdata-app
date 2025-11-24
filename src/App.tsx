import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ConfirmEmail from "./pages/ConfirmEmail";
import EmailConfirmed from "./pages/EmailConfirmed";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import MetaAdsDashboard from "./pages/MetaAdsDashboard";
import ConnectMeta from "./pages/ConnectMeta";
import ConnectWhatsApp from "./pages/ConnectWhatsApp";
import Settings from "./pages/Settings";
import History from "./pages/History";
import Subscription from "./pages/Subscription";
import NotFound from "./pages/NotFound";
import WhatsAppVerify from "./pages/WhatsAppVerify";
import WhatsAppLogin from "./pages/WhatsAppLogin";
import LandingPage from "./pages/LandingPage";
import LandingPageV2 from "./pages/LandingPageV2";
import LandingPageV3 from "./pages/LandingPageV3";
import LandingPageV4 from "./pages/LandingPageV4";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import DataDeletion from "./pages/DataDeletion";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, isSubscribed } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Allow access to subscription page even without active subscription
  if (!isSubscribed && window.location.pathname !== '/subscription') {
    return <Navigate to="/subscription" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  const { initialize } = useAuth();

  useEffect(() => {
    initialize();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPageV4 />} />
            <Route path="/lp-v1" element={<LandingPage />} />
            <Route path="/lp-v2" element={<LandingPageV2 />} />
            <Route path="/lp-v3" element={<LandingPageV3 />} />
            <Route path="/termos" element={<TermsOfService />} />
            <Route path="/privacidade" element={<PrivacyPolicy />} />
            <Route path="/exclusao-dados" element={<DataDeletion />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/whatsapp-login" element={<WhatsAppLogin />} />
            <Route path="/auth/verify" element={<WhatsAppVerify />} />
            <Route path="/confirm-email" element={<ConfirmEmail />} />
            <Route path="/email-confirmed" element={<EmailConfirmed />} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/meta-ads" element={<ProtectedRoute><MetaAdsDashboard /></ProtectedRoute>} />
            <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
            <Route path="/connect/meta" element={<ProtectedRoute><ConnectMeta /></ProtectedRoute>} />
            <Route path="/connect/whatsapp" element={<ProtectedRoute><ConnectWhatsApp /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
