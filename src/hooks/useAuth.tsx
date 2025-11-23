import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  profile: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSubscribed: boolean;
  subscriptionEnd: string | null;
  subscriptionTier: string | null;
  cancelAtPeriodEnd: boolean;
  metaConnected: boolean;
  whatsappConnected: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, whatsapp?: string) => Promise<void>;
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
      cancelAtPeriodEnd: false,
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
                cancelAtPeriodEnd: false,
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

      login: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Check if email is confirmed
        if (data.user && !data.user.email_confirmed_at) {
          await supabase.auth.signOut();
          throw new Error('Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada.');
        }

        if (data.user) {
          const { data: profile } = await supabase
            .from('subscribers')
            .select('*')
            .eq('user_id', data.user.id)
            .single();

          set({
            user: data.user,
            profile,
            isAuthenticated: true,
            isSubscribed: profile?.subscribed || false,
            subscriptionEnd: profile?.subscription_end,
            cancelAtPeriodEnd: profile?.cancel_at_period_end || false,
            metaConnected: profile?.meta_connected || false,
            whatsappConnected: profile?.whatsapp_connected || false,
          });
        }
      },

      register: async (name: string, email: string, password: string, whatsapp?: string) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name, whatsapp },
            emailRedirectTo: `${window.location.origin}/email-confirmed`,
          },
        });

        if (error) throw error;

        // Don't auto-login after registration - user needs to confirm email first
        // Just throw a success message
        if (data.user) {
          throw new Error('REGISTRATION_SUCCESS'); // Special error code to handle in the UI
        }
      },

      logout: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        // Clear all storage to ensure clean logout
        localStorage.removeItem('auth-storage');

        set({
          user: null,
          profile: null,
          isAuthenticated: false,
          isSubscribed: false,
          subscriptionEnd: null,
          cancelAtPeriodEnd: false,
        });
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
