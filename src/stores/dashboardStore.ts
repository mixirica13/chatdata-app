import { create } from 'zustand';
import type { Dashboard, Widget } from '@/types/dashboard';

interface DashboardState {
  currentDashboard: Dashboard | null;
  dashboards: Dashboard[];
  isEditing: boolean;
  setCurrentDashboard: (dashboard: Dashboard | null) => void;
  setDashboards: (dashboards: Dashboard[]) => void;
  setIsEditing: (isEditing: boolean) => void;
  updateWidgetPosition: (widgetId: string, position: { x: number; y: number; w: number; h: number }) => void;
  addWidget: (widget: Widget) => void;
  removeWidget: (widgetId: string) => void;
  updateWidget: (widgetId: string, updates: Partial<Widget>) => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  currentDashboard: null,
  dashboards: [],
  isEditing: false,

  setCurrentDashboard: (dashboard) => set({ currentDashboard: dashboard }),

  setDashboards: (dashboards) => set({ dashboards }),

  setIsEditing: (isEditing) => set({ isEditing }),

  updateWidgetPosition: (widgetId, position) => {
    const current = get().currentDashboard;
    if (!current?.widgets) return;

    const updatedWidgets = current.widgets.map((widget) =>
      widget.id === widgetId ? { ...widget, position } : widget
    );

    set({
      currentDashboard: {
        ...current,
        widgets: updatedWidgets,
      },
    });
  },

  addWidget: (widget) => {
    const current = get().currentDashboard;
    if (!current) return;

    set({
      currentDashboard: {
        ...current,
        widgets: [...(current.widgets || []), widget],
      },
    });
  },

  removeWidget: (widgetId) => {
    const current = get().currentDashboard;
    if (!current?.widgets) return;

    set({
      currentDashboard: {
        ...current,
        widgets: current.widgets.filter((w) => w.id !== widgetId),
      },
    });
  },

  updateWidget: (widgetId, updates) => {
    const current = get().currentDashboard;
    if (!current?.widgets) return;

    const updatedWidgets = current.widgets.map((widget) =>
      widget.id === widgetId ? { ...widget, ...updates } : widget
    );

    set({
      currentDashboard: {
        ...current,
        widgets: updatedWidgets,
      },
    });
  },
}));
