import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, X, Settings } from 'lucide-react';
import type { Widget } from '@/types/dashboard';
import { KPIWidget } from './widgets/KPIWidget';
import { ChartWidget } from './widgets/ChartWidget';
import { CampaignTableWidget } from './widgets/CampaignTableWidget';
import { AdSetTableWidget } from './widgets/AdSetTableWidget';
import { AdTableWidget } from './widgets/AdTableWidget';
import { AccountBalanceWidget } from './widgets/AccountBalanceWidget';
import { ScheduledBudgetWidget } from './widgets/ScheduledBudgetWidget';
import { WidgetConfigModal } from './widgets/WidgetConfigModal';

// Widgets que podem ser configurados
const CONFIGURABLE_WIDGETS = [
  'KPI_CONVERSIONS',
  'KPI_CPA',
  'KPI_ROAS',
  'KPI_SPEND',
  'KPI_IMPRESSIONS',
  'KPI_CLICKS',
  'KPI_REACH',
  'KPI_CTR',
  'KPI_CPC',
  'KPI_CPM',
  'CHART_LINE',
  'CHART_BAR',
  'CHART_PIE',
];

interface WidgetWrapperProps {
  widget: Widget;
  isEditing: boolean;
  onRemove: () => void;
}

export function WidgetWrapper({ widget, isEditing, onRemove }: WidgetWrapperProps) {
  const [configOpen, setConfigOpen] = useState(false);
  const [localWidget, setLocalWidget] = useState(widget);

  const isConfigurable = CONFIGURABLE_WIDGETS.includes(widget.type);

  const handleConfigSave = (newConfig: Widget['config']) => {
    setLocalWidget({ ...localWidget, config: newConfig });
  };

  const renderWidget = () => {
    switch (localWidget.type) {
      case 'KPI_SPEND':
      case 'KPI_IMPRESSIONS':
      case 'KPI_CLICKS':
      case 'KPI_REACH':
      case 'KPI_CTR':
      case 'KPI_CPC':
      case 'KPI_CPM':
      case 'KPI_CONVERSIONS':
      case 'KPI_CPA':
      case 'KPI_ROAS':
      case 'KPI_COST_PER_CONVERSION':
        return <KPIWidget widget={localWidget} />;
      case 'CHART_LINE':
      case 'CHART_BAR':
      case 'CHART_PIE':
        return <ChartWidget widget={localWidget} />;
      case 'TABLE_CAMPAIGNS':
        return <CampaignTableWidget widget={localWidget} />;
      case 'TABLE_ADSETS':
        return <AdSetTableWidget widget={localWidget} />;
      case 'TABLE_ADS':
        return <AdTableWidget widget={localWidget} />;
      case 'ACCOUNT_BALANCE':
        return <AccountBalanceWidget widget={localWidget} />;
      case 'KPI_SCHEDULED_BUDGET':
        return <ScheduledBudgetWidget widget={localWidget} />;
      default:
        return (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Widget não suportado
          </div>
        );
    }
  };

  const displayTitle = localWidget.config.customTitle || localWidget.title;

  return (
    <>
      <Card className="h-full overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            {isEditing && (
              <div className="widget-drag-handle cursor-move">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <CardTitle className="text-sm font-medium">{displayTitle}</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {isConfigurable && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setConfigOpen(true)}
                title="Configurar widget"
              >
                <Settings className="h-3 w-3" />
              </Button>
            )}
            {isEditing && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onRemove}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="h-[calc(100%-3rem)] pb-4">
          {renderWidget()}
        </CardContent>
      </Card>

      {isConfigurable && (
        <WidgetConfigModal
          widget={localWidget}
          open={configOpen}
          onOpenChange={setConfigOpen}
          onSave={handleConfigSave}
        />
      )}
    </>
  );
}
