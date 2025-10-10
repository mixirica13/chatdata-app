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
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSubscription: () => Promise<void>;
  initialize: () => Promise<void>;
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

      initialize: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            // Get profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();

            set({
              user: session.user,
              profile,
              isAuthenticated: true,
              isSubscribed: profile?.subscription_status === 'active',
              subscriptionEnd: profile?.subscription_end_date,
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
                .from('profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single();

              set({
                user: session.user,
                profile,
                isAuthenticated: true,
                isSubscribed: profile?.subscription_status === 'active',
                subscriptionEnd: profile?.subscription_end_date,
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

        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', data.user.id)
            .single();

          set({
            user: data.user,
            profile,
            isAuthenticated: true,
            isSubscribed: profile?.subscription_status === 'active',
            subscriptionEnd: profile?.subscription_end_date,
          });
        }
      },

      register: async (name: string, email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (error) throw error;

        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', data.user.id)
            .single();

          set({
            user: data.user,
            profile,
            isAuthenticated: true,
            isSubscribed: false,
            subscriptionEnd: null,
          });
        }
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({
          user: null,
          profile: null,
          isAuthenticated: false,
          isSubscribed: false,
          subscriptionEnd: null,
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
              .from('profiles')
              .select('*')
              .eq('user_id', state.user.id)
              .single();

            set({
              profile,
              isSubscribed: profile?.subscription_status === 'active',
              subscriptionEnd: profile?.subscription_end_date,
            });
          }
        } catch (error) {
          console.error('Check subscription error:', error);
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
