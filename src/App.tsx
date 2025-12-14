import { useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

// Eagerly load landing page (first paint)
import LandingPageV4 from "./pages/LandingPageV4";

// Lazy load all other pages for code splitting
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ConfirmEmail = lazy(() => import("./pages/ConfirmEmail"));
const EmailConfirmed = lazy(() => import("./pages/EmailConfirmed"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MetaAdsDashboard = lazy(() => import("./pages/MetaAdsDashboard"));
const ConnectMeta = lazy(() => import("./pages/ConnectMeta"));
const ConnectWhatsApp = lazy(() => import("./pages/ConnectWhatsApp"));
const Settings = lazy(() => import("./pages/Settings"));
const History = lazy(() => import("./pages/History"));
const Subscription = lazy(() => import("./pages/Subscription"));
const NotFound = lazy(() => import("./pages/NotFound"));
const WhatsAppVerify = lazy(() => import("./pages/WhatsAppVerify"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LandingPageV2 = lazy(() => import("./pages/LandingPageV2"));
const LandingPageV3 = lazy(() => import("./pages/LandingPageV3"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const DataDeletion = lazy(() => import("./pages/DataDeletion"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-black">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

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

  // Allow access to subscription, reset-password and settings pages even without active subscription
  const allowedPaths = ['/subscription', '/reset-password', '/settings'];
  if (!isSubscribed && !allowedPaths.includes(window.location.pathname)) {
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
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Landing page loaded eagerly for fast first paint */}
              <Route path="/" element={<LandingPageV4 />} />

              {/* Lazy loaded pages */}
              <Route path="/lp-v1" element={<LandingPage />} />
              <Route path="/lp-v2" element={<LandingPageV2 />} />
              <Route path="/lp-v3" element={<LandingPageV3 />} />
              <Route path="/termos" element={<TermsOfService />} />
              <Route path="/privacidade" element={<PrivacyPolicy />} />
              <Route path="/exclusao-dados" element={<DataDeletion />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/auth/verify" element={<WhatsAppVerify />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
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
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
