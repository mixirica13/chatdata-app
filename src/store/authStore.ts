import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  metaConnected: boolean;
  whatsappConnected: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  completeOnboarding: () => void;
  connectMeta: () => void;
  disconnectMeta: () => void;
  connectWhatsapp: () => void;
  disconnectWhatsapp: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isOnboarded: false,
      metaConnected: false,
      whatsappConnected: false,

      login: async (email: string, password: string) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        set({
          user: {
            id: '1',
            name: 'João Silva',
            email: email,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
          },
          isAuthenticated: true,
        });
      },

      register: async (name: string, email: string, password: string) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        set({
          user: {
            id: '1',
            name: name,
            email: email,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + name,
          },
          isAuthenticated: true,
          isOnboarded: false,
        });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isOnboarded: false,
          metaConnected: false,
          whatsappConnected: false,
        });
      },

      completeOnboarding: () => {
        set({ isOnboarded: true });
      },

      connectMeta: () => {
        set({ metaConnected: true });
      },

      disconnectMeta: () => {
        set({ metaConnected: false });
      },

      connectWhatsapp: () => {
        set({ whatsappConnected: true });
      },

      disconnectWhatsapp: () => {
        set({ whatsappConnected: false });
      },

      updateUser: (userData: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
