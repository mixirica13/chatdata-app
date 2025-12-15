import { useState, useCallback, useEffect } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import { useDashboardStore } from '@/stores/dashboardStore';
import { WidgetWrapper } from './WidgetWrapper';
import { AddWidgetModal } from './AddWidgetModal';
import { Button } from '@/components/ui/button';
import { Plus, Save, Pencil, X } from 'lucide-react';
import { useCreateWidget, useUpdateWidgetPositions, useDeleteWidget } from '@/hooks/useMetaApi';
import { toast } from 'sonner';
import type { Widget, WidgetType } from '@/types/dashboard';
import { WIDGET_DEFINITIONS } from '@/types/dashboard';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const GRID_COLS = 12;
const ROW_HEIGHT = 100;

export function DashboardGrid() {
  const {
    currentDashboard,
    isEditing,
    setIsEditing,
    updateWidgetPosition,
    addWidget,
    removeWidget,
  } = useDashboardStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [containerWidth, setContainerWidth] = useState(1200);

  const createWidgetMutation = useCreateWidget();
  const updatePositionsMutation = useUpdateWidgetPositions();
  const deleteWidgetMutation = useDeleteWidget();

  useEffect(() => {
    const updateWidth = () => {
      const container = document.getElementById('dashboard-container');
      if (container) {
        setContainerWidth(container.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const widgets = currentDashboard?.widgets || [];

  const layout: Layout[] = widgets.map((widget) => ({
    i: widget.id,
    x: widget.position.x,
    y: widget.position.y,
    w: widget.position.w,
    h: widget.position.h,
    minW: WIDGET_DEFINITIONS[widget.type as WidgetType]?.minSize?.w || 2,
    minH: WIDGET_DEFINITIONS[widget.type as WidgetType]?.minSize?.h || 2,
  }));

  const handleLayoutChange = useCallback(
    (newLayout: Layout[]) => {
      if (!isEditing) return;

      newLayout.forEach((item) => {
        const widget = widgets.find((w) => w.id === item.i);
        if (widget) {
          const positionChanged =
            widget.position.x !== item.x ||
            widget.position.y !== item.y ||
            widget.position.w !== item.w ||
            widget.position.h !== item.h;

          if (positionChanged) {
            updateWidgetPosition(item.i, {
              x: item.x,
              y: item.y,
              w: item.w,
              h: item.h,
            });
          }
        }
      });
    },
    [isEditing, widgets, updateWidgetPosition]
  );

  const handleSaveLayout = () => {
    const widgetsToUpdate = widgets.map((widget) => ({
      id: widget.id,
      position: widget.position,
    }));

    updatePositionsMutation.mutate(widgetsToUpdate, {
      onSuccess: () => {
        toast.success('Layout salvo!');
        setIsEditing(false);
      },
      onError: () => {
        toast.error('Erro ao salvar layout');
      },
    });
  };

  const handleAddWidget = (type: WidgetType, title: string) => {
    if (!currentDashboard) return;

    const definition = WIDGET_DEFINITIONS[type];
    const { w, h } = definition.defaultSize;

    // Find the lowest empty position
    let y = 0;
    widgets.forEach((widget) => {
      const widgetBottom = widget.position.y + widget.position.h;
      if (widgetBottom > y) y = widgetBottom;
    });

    createWidgetMutation.mutate(
      {
        dashboardId: currentDashboard.id,
        type,
        title,
        position: { x: 0, y, w, h },
        config: {},
      },
      {
        onSuccess: (data) => {
          addWidget(data as Widget);
          toast.success('Widget adicionado!');
        },
        onError: () => {
          toast.error('Erro ao adicionar widget');
        },
      }
    );

    setIsAddModalOpen(false);
  };

  const handleRemoveWidget = (widgetId: string) => {
    deleteWidgetMutation.mutate(widgetId, {
      onSuccess: () => {
        removeWidget(widgetId);
        toast.success('Widget removido!');
      },
      onError: () => {
        toast.error('Erro ao remover widget');
      },
    });
  };

  if (!currentDashboard) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/50 bg-background/80 px-6 py-3 backdrop-blur">
        <h2 className="text-lg font-semibold">{currentDashboard.name}</h2>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Widget
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSaveLayout}>
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>
          )}
        </div>
      </div>

      <div id="dashboard-container" className="p-6">
        {widgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="mb-4 text-muted-foreground">
              Nenhum widget configurado
            </p>
            <Button onClick={() => {
              setIsEditing(true);
              setIsAddModalOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Widget
            </Button>
          </div>
        ) : (
          <GridLayout
            className="layout"
            layout={layout}
            cols={GRID_COLS}
            rowHeight={ROW_HEIGHT}
            width={containerWidth - 48}
            isDraggable={isEditing}
            isResizable={isEditing}
            onLayoutChange={handleLayoutChange}
            draggableHandle=".widget-drag-handle"
            compactType="vertical"
            margin={[16, 16]}
          >
            {widgets.map((widget) => (
              <div key={widget.id}>
                <WidgetWrapper
                  widget={widget}
                  isEditing={isEditing}
                  onRemove={() => handleRemoveWidget(widget.id)}
                />
              </div>
            ))}
          </GridLayout>
        )}
      </div>

      <AddWidgetModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onAdd={handleAddWidget}
      />
    </div>
  );
}
