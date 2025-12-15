import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { WIDGET_DEFINITIONS, WidgetType } from '@/types/dashboard';
import {
  DollarSign,
  Eye,
  MousePointerClick,
  Users,
  Percent,
  MousePointer,
  BarChart3,
  Target,
  UserPlus,
  ShoppingCart,
  TrendingUp,
  Table,
  LineChart,
  BarChart,
  PieChart,
  Wallet,
  Calculator,
  CalendarClock,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  DollarSign,
  Eye,
  MousePointerClick,
  Users,
  Percent,
  MousePointer,
  BarChart3,
  Target,
  UserPlus,
  ShoppingCart,
  TrendingUp,
  Table,
  LineChart,
  BarChart,
  PieChart,
  Wallet,
  Calculator,
  CalendarClock,
};

interface AddWidgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (type: WidgetType, title: string) => void;
}

export function AddWidgetModal({ open, onOpenChange, onAdd }: AddWidgetModalProps) {
  const [selectedType, setSelectedType] = useState<WidgetType | null>(null);
  const [title, setTitle] = useState('');

  const handleAdd = () => {
    if (!selectedType) return;
    const finalTitle = title.trim() || WIDGET_DEFINITIONS[selectedType].name;
    onAdd(selectedType, finalTitle);
    setSelectedType(null);
    setTitle('');
  };

  const handleClose = () => {
    setSelectedType(null);
    setTitle('');
    onOpenChange(false);
  };

  const widgetsByCategory = {
    kpi: Object.entries(WIDGET_DEFINITIONS).filter(([, def]) => def.category === 'kpi'),
    table: Object.entries(WIDGET_DEFINITIONS).filter(([, def]) => def.category === 'table'),
    chart: Object.entries(WIDGET_DEFINITIONS).filter(([, def]) => def.category === 'chart'),
    special: Object.entries(WIDGET_DEFINITIONS).filter(([, def]) => def.category === 'special'),
  };

  const renderWidgetOption = (type: string, definition: typeof WIDGET_DEFINITIONS[WidgetType]) => {
    const Icon = iconMap[definition.icon] || BarChart3;
    return (
      <button
        key={type}
        onClick={() => {
          setSelectedType(type as WidgetType);
          setTitle(definition.name);
        }}
        className={cn(
          'flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors hover:bg-muted/50',
          selectedType === type && 'border-primary bg-primary/5'
        )}
      >
        <Icon className="h-8 w-8 text-primary" />
        <span className="text-sm font-medium">{definition.name}</span>
        <span className="text-xs text-muted-foreground">{definition.description}</span>
      </button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar Widget</DialogTitle>
          <DialogDescription>
            Selecione o tipo de widget que deseja adicionar ao dashboard.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="kpi" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="kpi">KPIs</TabsTrigger>
            <TabsTrigger value="table">Tabelas</TabsTrigger>
            <TabsTrigger value="chart">Gráficos</TabsTrigger>
            <TabsTrigger value="special">Especiais</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[300px] mt-4">
            <TabsContent value="kpi" className="mt-0">
              <div className="grid grid-cols-3 gap-3">
                {widgetsByCategory.kpi.map(([type, def]) =>
                  renderWidgetOption(type, def)
                )}
              </div>
            </TabsContent>

            <TabsContent value="table" className="mt-0">
              <div className="grid grid-cols-3 gap-3">
                {widgetsByCategory.table.map(([type, def]) =>
                  renderWidgetOption(type, def)
                )}
              </div>
            </TabsContent>

            <TabsContent value="chart" className="mt-0">
              <div className="grid grid-cols-3 gap-3">
                {widgetsByCategory.chart.map(([type, def]) =>
                  renderWidgetOption(type, def)
                )}
              </div>
            </TabsContent>

            <TabsContent value="special" className="mt-0">
              <div className="grid grid-cols-3 gap-3">
                {widgetsByCategory.special.map(([type, def]) =>
                  renderWidgetOption(type, def)
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {selectedType && (
          <div className="space-y-2 border-t pt-4">
            <Label htmlFor="widget-title">Título do Widget</Label>
            <Input
              id="widget-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={WIDGET_DEFINITIONS[selectedType].name}
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleAdd} disabled={!selectedType}>
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
