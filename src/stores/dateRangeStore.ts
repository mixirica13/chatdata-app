import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type DatePreset = 'today' | 'yesterday' | 'last_7d' | 'last_14d' | 'last_30d' | 'last_90d' | 'this_month' | 'last_month' | 'custom';

interface DateRangeState {
  preset: DatePreset;
  from: string | null;
  to: string | null;
  setPreset: (preset: DatePreset) => void;
  setCustomRange: (from: Date, to: Date) => void;
  getTimeRange: () => { since: string; until: string };
  getComparisonRange: () => { since: string; until: string };
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function getStartOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getEndOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export const useDateRangeStore = create<DateRangeState>()(
  persist(
    (set, get) => ({
      preset: 'last_7d',
      from: null,
      to: null,

      setPreset: (preset) => set({ preset, from: null, to: null }),

      setCustomRange: (from, to) =>
        set({
          preset: 'custom',
          from: formatDate(from),
          to: formatDate(to),
        }),

      getTimeRange: () => {
        const { preset, from, to } = get();
        const today = new Date();

        if (preset === 'custom' && from && to) {
          return { since: from, until: to };
        }

        switch (preset) {
          case 'today':
            return { since: formatDate(today), until: formatDate(today) };
          case 'yesterday': {
            const yesterday = getDaysAgo(1);
            return { since: formatDate(yesterday), until: formatDate(yesterday) };
          }
          case 'last_7d':
            return { since: formatDate(getDaysAgo(7)), until: formatDate(today) };
          case 'last_14d':
            return { since: formatDate(getDaysAgo(14)), until: formatDate(today) };
          case 'last_30d':
            return { since: formatDate(getDaysAgo(30)), until: formatDate(today) };
          case 'last_90d':
            return { since: formatDate(getDaysAgo(90)), until: formatDate(today) };
          case 'this_month':
            return {
              since: formatDate(getStartOfMonth(today)),
              until: formatDate(today),
            };
          case 'last_month': {
            const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            return {
              since: formatDate(getStartOfMonth(lastMonth)),
              until: formatDate(getEndOfMonth(lastMonth)),
            };
          }
          default:
            return { since: formatDate(getDaysAgo(7)), until: formatDate(today) };
        }
      },

      getComparisonRange: () => {
        const { preset, from, to } = get();
        const today = new Date();

        const getDaysInRange = (since: string, until: string) => {
          const start = new Date(since);
          const end = new Date(until);
          return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        };

        if (preset === 'custom' && from && to) {
          const days = getDaysInRange(from, to);
          const compEnd = new Date(from);
          compEnd.setDate(compEnd.getDate() - 1);
          const compStart = new Date(compEnd);
          compStart.setDate(compStart.getDate() - days + 1);
          return { since: formatDate(compStart), until: formatDate(compEnd) };
        }

        switch (preset) {
          case 'today': {
            const yesterday = getDaysAgo(1);
            return { since: formatDate(yesterday), until: formatDate(yesterday) };
          }
          case 'yesterday': {
            const twoDaysAgo = getDaysAgo(2);
            return { since: formatDate(twoDaysAgo), until: formatDate(twoDaysAgo) };
          }
          case 'last_7d':
            return { since: formatDate(getDaysAgo(14)), until: formatDate(getDaysAgo(8)) };
          case 'last_14d':
            return { since: formatDate(getDaysAgo(28)), until: formatDate(getDaysAgo(15)) };
          case 'last_30d':
            return { since: formatDate(getDaysAgo(60)), until: formatDate(getDaysAgo(31)) };
          case 'last_90d':
            return { since: formatDate(getDaysAgo(180)), until: formatDate(getDaysAgo(91)) };
          case 'this_month': {
            const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const dayOfMonth = today.getDate();
            const compEnd = new Date(lastMonth);
            compEnd.setDate(Math.min(dayOfMonth, getEndOfMonth(lastMonth).getDate()));
            return {
              since: formatDate(getStartOfMonth(lastMonth)),
              until: formatDate(compEnd),
            };
          }
          case 'last_month': {
            const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 1);
            return {
              since: formatDate(getStartOfMonth(twoMonthsAgo)),
              until: formatDate(getEndOfMonth(twoMonthsAgo)),
            };
          }
          default:
            return { since: formatDate(getDaysAgo(14)), until: formatDate(getDaysAgo(8)) };
        }
      },
    }),
    {
      name: 'chatdata-date-range-storage',
    }
  )
);
