import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { posthog } from '@/lib/posthog';

interface AuthState {
  user: User | null;
  profile: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSubscribed: boolean;
  subscriptionEnd: string | null;
  subscriptionTier: string | null;
  subscriptionStatus: string | null;
  cancelAtPeriodEnd: boolean;
  hadSubscription: boolean; // Se já teve assinatura/trial antes
  metaConnected: boolean;
  whatsappConnected: boolean;
  loginWithMagicLink: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  checkSubscription: () => Promise<void>;
  initialize: () => Promise<void>;
  disconnectMeta: () => Promise<void>;
  disconnectWhatsapp: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: true,
      isSubscribed: false,
      subscriptionEnd: null,
      subscriptionTier: null,
      subscriptionStatus: null,
      cancelAtPeriodEnd: false,
      hadSubscription: false,
      metaConnected: false,
      whatsappConnected: false,

      initialize: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            // Get subscriber data (replaces profile)
            const { data: profile } = await supabase
              .from('subscribers')
              .select('*')
              .eq('user_id', session.user.id)
              .single();

            set({
              user: session.user,
              profile,
              isAuthenticated: true,
              isSubscribed: profile?.subscribed || false,
              subscriptionEnd: profile?.subscription_end,
              subscriptionTier: profile?.subscription_tier || null,
              subscriptionStatus: profile?.subscription_status || null,
              cancelAtPeriodEnd: profile?.cancel_at_period_end || false,
              metaConnected: profile?.meta_connected || false,
              whatsappConnected: profile?.whatsapp_connected || false,
              isLoading: false,
            });

            // Check subscription in background
            get().checkSubscription();
          } else {
            set({ isLoading: false });
          }

          // Listen to auth changes
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
              const { data: profile } = await supabase
                .from('subscribers')
                .select('*')
                .eq('user_id', session.user.id)
                .single();

              set({
                user: session.user,
                profile,
                isAuthenticated: true,
                isSubscribed: profile?.subscribed || false,
                subscriptionEnd: profile?.subscription_end,
                subscriptionTier: profile?.subscription_tier || null,
                subscriptionStatus: profile?.subscription_status || null,
                cancelAtPeriodEnd: profile?.cancel_at_period_end || false,
                metaConnected: profile?.meta_connected || false,
                whatsappConnected: profile?.whatsapp_connected || false,
              });

              if (event === 'SIGNED_IN') {
                setTimeout(() => get().checkSubscription(), 0);
              }
            } else {
              set({
                user: null,
                profile: null,
                isAuthenticated: false,
                isSubscribed: false,
                subscriptionEnd: null,
                subscriptionTier: null,
                subscriptionStatus: null,
                cancelAtPeriodEnd: false,
                hadSubscription: false,
                metaConnected: false,
                whatsappConnected: false,
              });
            }
          });
        } catch (error) {
          console.error('Initialize error:', error);
          set({ isLoading: false });
        }
      },

      loginWithMagicLink: async (email: string) => {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: true,
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;
      },

      loginWithGoogle: async () => {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;
      },

      logout: async () => {
        try {
          // Track logout event before clearing session
          try {
            if (typeof posthog !== 'undefined' && posthog._isIdentified) {
              posthog.capture('logout');
              posthog.reset(); // Reset user identification
            }
          } catch (e) {
            // Ignore posthog errors
            console.warn('PostHog error during logout:', e);
          }

          const { error } = await supabase.auth.signOut();
          if (error) throw error;

          // Clear all storage to ensure clean logout
          localStorage.removeItem('auth-storage');
          sessionStorage.clear();

          // Reset ALL state to initial values
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
            isSubscribed: false,
            subscriptionEnd: null,
            subscriptionTier: null,
            subscriptionStatus: null,
            cancelAtPeriodEnd: false,
            hadSubscription: false,
            metaConnected: false,
            whatsappConnected: false,
            isLoading: false,
          });
        } catch (error) {
          console.error('Logout error:', error);
          // Force state reset even on error
          localStorage.removeItem('auth-storage');
          sessionStorage.clear();

          set({
            user: null,
            profile: null,
            isAuthenticated: false,
            isSubscribed: false,
            subscriptionEnd: null,
            subscriptionTier: null,
            subscriptionStatus: null,
            cancelAtPeriodEnd: false,
            hadSubscription: false,
            metaConnected: false,
            whatsappConnected: false,
            isLoading: false,
          });

          throw error;
        }
      },

      checkSubscription: async () => {
        try {
          const { data, error } = await supabase.functions.invoke('check-subscription');
          
          if (error) {
            console.error('Subscription check error:', error);
            return;
          }

          // Refresh profile
          const state = get();
          if (state.user) {
            const { data: profile } = await supabase
              .from('subscribers')
              .select('*')
              .eq('user_id', state.user.id)
              .single();

            set({
              profile,
              isSubscribed: profile?.subscribed || false,
              subscriptionEnd: profile?.subscription_end,
              subscriptionTier: profile?.subscription_tier || null,
              subscriptionStatus: profile?.subscription_status || null,
              cancelAtPeriodEnd: profile?.cancel_at_period_end || false,
              metaConnected: profile?.meta_connected || false,
              whatsappConnected: profile?.whatsapp_connected || false,
            });
          }
        } catch (error) {
          console.error('Check subscription error:', error);
        }
      },

      disconnectMeta: async () => {
        try {
          const state = get();
          if (state.user) {
            // Delete credentials from meta_credentials table
            const { error: credentialsError } = await supabase
              .from('meta_credentials')
              .delete()
              .eq('user_id', state.user.id);

            if (credentialsError) {
              console.error('Error deleting meta credentials:', credentialsError);
              throw credentialsError;
            }

            // Delete MCP token from chatdata_mcp_tokens table
            const { error: mcpTokenError } = await supabase
              .from('chatdata_mcp_tokens')
              .delete()
              .eq('user_id', state.user.id);

            if (mcpTokenError) {
              console.error('Error deleting MCP token:', mcpTokenError);
              // Don't throw - credentials already deleted
            }

            // Update meta_connected flag in subscribers table
            const { error: subscriberError } = await supabase
              .from('subscribers')
              .update({ meta_connected: false })
              .eq('user_id', state.user.id);

            if (subscriberError) throw subscriberError;

            set({ metaConnected: false });
          }
        } catch (error) {
          console.error('Disconnect Meta error:', error);
          throw error;
        }
      },

      disconnectWhatsapp: async () => {
        try {
          const state = get();
          if (state.user) {
            const { error } = await supabase
              .from('subscribers')
              .update({
                whatsapp_connected: false,
                whatsapp_phone: null
              })
              .eq('user_id', state.user.id);

            if (error) throw error;

            set({ whatsappConnected: false });
          }
        } catch (error) {
          console.error('Disconnect WhatsApp error:', error);
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Only persist basic user info
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
