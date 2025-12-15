import { useState, useEffect } from 'react';
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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Widget, WidgetConfig } from '@/types/dashboard';
import { useUpdateWidgetConfig } from '@/hooks/useMetaApi';
import { toast } from 'sonner';

interface WidgetConfigModalProps {
  widget: Widget;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (config: WidgetConfig) => void;
}

const ACTION_TYPE_OPTIONS = [
  { value: 'purchase', label: 'Compras (Purchase)' },
  { value: 'omni_purchase', label: 'Compras Omnichannel' },
  { value: 'lead', label: 'Leads' },
  { value: 'omni_lead', label: 'Leads Omnichannel' },
  { value: 'complete_registration', label: 'Cadastros Completos' },
  { value: 'add_to_cart', label: 'Adicionar ao Carrinho' },
  { value: 'initiate_checkout', label: 'Iniciar Checkout' },
  { value: 'contact', label: 'Contato' },
  { value: 'link_click', label: 'Cliques no Link' },
  { value: 'landing_page_view', label: 'Visualizações da LP' },
];

const METRIC_OPTIONS = [
  { value: 'spend', label: 'Gasto' },
  { value: 'impressions', label: 'Impressões' },
  { value: 'clicks', label: 'Cliques' },
  { value: 'reach', label: 'Alcance' },
  { value: 'ctr', label: 'CTR' },
  { value: 'cpc', label: 'CPC' },
  { value: 'cpm', label: 'CPM' },
];

export function WidgetConfigModal({
  widget,
  open,
  onOpenChange,
  onSave,
}: WidgetConfigModalProps) {
  const [config, setConfig] = useState<WidgetConfig>(widget.config);
  const updateConfigMutation = useUpdateWidgetConfig();

  useEffect(() => {
    setConfig(widget.config);
  }, [widget.config]);

  const handleSave = () => {
    updateConfigMutation.mutate(
      { widgetId: widget.id, config },
      {
        onSuccess: () => {
          onSave(config);
          onOpenChange(false);
          toast.success('Configuração salva!');
        },
        onError: () => {
          toast.error('Erro ao salvar configuração');
        },
      }
    );
  };

  const isKPIWidget = widget.type.startsWith('KPI_');
  const isChartWidget = widget.type.startsWith('CHART_');
  const needsActionType = ['KPI_CONVERSIONS', 'KPI_CPA', 'KPI_ROAS'].includes(widget.type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Configurar Widget</DialogTitle>
          <DialogDescription className="text-gray-400">
            Personalize as configurações deste widget.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Título Customizado */}
          <div className="space-y-2">
            <Label htmlFor="custom-title" className="text-white">
              Título Customizado
            </Label>
            <Input
              id="custom-title"
              value={config.customTitle || ''}
              onChange={(e) => setConfig({ ...config, customTitle: e.target.value })}
              placeholder={widget.title}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>

          {/* Mostrar Comparação (para KPIs) */}
          {isKPIWidget && (
            <div className="flex items-center justify-between">
              <Label htmlFor="show-comparison" className="text-white">
                Mostrar comparação com período anterior
              </Label>
              <Switch
                id="show-comparison"
                checked={config.showComparison !== false}
                onCheckedChange={(checked) =>
                  setConfig({ ...config, showComparison: checked })
                }
              />
            </div>
          )}

          {/* Tipo de Ação (para conversões) */}
          {needsActionType && (
            <div className="space-y-2">
              <Label htmlFor="action-type" className="text-white">
                Tipo de Conversão
              </Label>
              <Select
                value={config.actionType || 'purchase'}
                onValueChange={(value) => setConfig({ ...config, actionType: value })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/10">
                  {ACTION_TYPE_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-white hover:bg-white/10 focus:bg-white/10"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Métrica (para gráficos) */}
          {isChartWidget && (
            <div className="space-y-2">
              <Label htmlFor="metric" className="text-white">
                Métrica do Gráfico
              </Label>
              <Select
                value={config.metric || 'spend'}
                onValueChange={(value) => setConfig({ ...config, metric: value })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Selecione a métrica" />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/10">
                  {METRIC_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-white hover:bg-white/10 focus:bg-white/10"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#46CCC6] text-black hover:bg-[#46CCC6]/90"
            disabled={updateConfigMutation.isPending}
          >
            {updateConfigMutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
