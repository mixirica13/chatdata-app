import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SelectedAccountsState {
  selectedAccountIds: string[];
  setSelectedAccounts: (ids: string[]) => void;
  toggleAccount: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearAll: () => void;
  isSelected: (id: string) => boolean;
}

export const useSelectedAccountsStore = create<SelectedAccountsState>()(
  persist(
    (set, get) => ({
      selectedAccountIds: [],

      setSelectedAccounts: (ids) => set({ selectedAccountIds: ids }),

      toggleAccount: (id) => {
        const current = get().selectedAccountIds;
        if (current.includes(id)) {
          set({ selectedAccountIds: current.filter((i) => i !== id) });
        } else {
          set({ selectedAccountIds: [...current, id] });
        }
      },

      selectAll: (ids) => set({ selectedAccountIds: ids }),

      clearAll: () => set({ selectedAccountIds: [] }),

      isSelected: (id) => get().selectedAccountIds.includes(id),
    }),
    {
      name: 'chatdata-selected-accounts-storage',
    }
  )
);
