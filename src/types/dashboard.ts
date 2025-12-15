// Dashboard Types
export type WidgetType =
  | 'KPI_SPEND'
  | 'KPI_IMPRESSIONS'
  | 'KPI_CLICKS'
  | 'KPI_REACH'
  | 'KPI_CTR'
  | 'KPI_CPC'
  | 'KPI_CPM'
  | 'KPI_CONVERSIONS'
  | 'KPI_CPA'
  | 'KPI_ROAS'
  | 'KPI_COST_PER_CONVERSION'
  | 'KPI_SCHEDULED_BUDGET'
  | 'TABLE_CAMPAIGNS'
  | 'TABLE_ADSETS'
  | 'TABLE_ADS'
  | 'CHART_LINE'
  | 'CHART_BAR'
  | 'CHART_PIE'
  | 'CHART_BURNUP'
  | 'ACCOUNT_BALANCE';

export interface WidgetPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WidgetConfig {
  accountIds?: string[];
  metric?: string;
  metrics?: string[];
  showComparison?: boolean;
  chartType?: 'line' | 'bar' | 'pie' | 'area';
  actionType?: string;
  customTitle?: string;
  burnupGoal?: number;
  burnupStartDate?: string;
  burnupEndDate?: string;
}

export interface Widget {
  id: string;
  dashboard_id: string;
  type: WidgetType;
  title: string;
  config: WidgetConfig;
  position: WidgetPosition;
}

export interface Dashboard {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  widgets?: Widget[];
  created_at?: string;
  updated_at?: string;
}

export interface DashboardAdAccount {
  id: string;
  user_id: string;
  account_id: string;
  account_name: string;
  currency: string;
  is_active: boolean;
  created_at?: string;
}

export type DatePreset =
  | 'today'
  | 'yesterday'
  | 'last_7d'
  | 'last_14d'
  | 'last_30d'
  | 'last_90d'
  | 'this_month'
  | 'last_month'
  | 'custom';

export interface DateRange {
  preset?: DatePreset | 'custom';
  from?: Date;
  to?: Date;
}

export const WIDGET_DEFINITIONS: Record<WidgetType, {
  name: string;
  description: string;
  icon: string;
  category: 'kpi' | 'table' | 'chart' | 'special';
  defaultSize: { w: number; h: number };
  minSize?: { w: number; h: number };
}> = {
  KPI_SPEND: {
    name: 'Gasto Total',
    description: 'Total gasto em anúncios',
    icon: 'DollarSign',
    category: 'kpi',
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 2, h: 2 },
  },
  KPI_IMPRESSIONS: {
    name: 'Impressões',
    description: 'Número total de impressões',
    icon: 'Eye',
    category: 'kpi',
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 2, h: 2 },
  },
  KPI_CLICKS: {
    name: 'Cliques',
    description: 'Número total de cliques',
    icon: 'MousePointerClick',
    category: 'kpi',
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 2, h: 2 },
  },
  KPI_REACH: {
    name: 'Alcance',
    description: 'Pessoas únicas alcançadas',
    icon: 'Users',
    category: 'kpi',
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 2, h: 2 },
  },
  KPI_CTR: {
    name: 'CTR',
    description: 'Taxa de cliques',
    icon: 'Percent',
    category: 'kpi',
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 2, h: 2 },
  },
  KPI_CPC: {
    name: 'CPC',
    description: 'Custo por clique',
    icon: 'MousePointer',
    category: 'kpi',
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 2, h: 2 },
  },
  KPI_CPM: {
    name: 'CPM',
    description: 'Custo por mil impressões',
    icon: 'BarChart3',
    category: 'kpi',
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 2, h: 2 },
  },
  KPI_CONVERSIONS: {
    name: 'Conversões',
    description: 'Total de conversões',
    icon: 'Target',
    category: 'kpi',
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 2, h: 2 },
  },
  KPI_CPA: {
    name: 'CPA',
    description: 'Custo por aquisição',
    icon: 'ShoppingCart',
    category: 'kpi',
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 2, h: 2 },
  },
  KPI_ROAS: {
    name: 'ROAS',
    description: 'Retorno sobre gasto em anúncios',
    icon: 'TrendingUp',
    category: 'kpi',
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 2, h: 2 },
  },
  KPI_COST_PER_CONVERSION: {
    name: 'Custo por Conversão',
    description: 'Gasto total dividido pelas conversões',
    icon: 'Calculator',
    category: 'kpi',
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 2, h: 2 },
  },
  KPI_SCHEDULED_BUDGET: {
    name: 'Gasto Programado',
    description: 'Orçamento diário total (CBO + ABO)',
    icon: 'CalendarClock',
    category: 'kpi',
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 2, h: 2 },
  },
  TABLE_CAMPAIGNS: {
    name: 'Tabela de Campanhas',
    description: 'Lista de campanhas com métricas',
    icon: 'Table',
    category: 'table',
    defaultSize: { w: 6, h: 4 },
    minSize: { w: 4, h: 3 },
  },
  TABLE_ADSETS: {
    name: 'Tabela de Conjuntos',
    description: 'Lista de conjuntos de anúncios',
    icon: 'Table',
    category: 'table',
    defaultSize: { w: 6, h: 4 },
    minSize: { w: 4, h: 3 },
  },
  TABLE_ADS: {
    name: 'Tabela de Anúncios',
    description: 'Lista de anúncios',
    icon: 'Table',
    category: 'table',
    defaultSize: { w: 6, h: 4 },
    minSize: { w: 4, h: 3 },
  },
  CHART_LINE: {
    name: 'Gráfico de Linha',
    description: 'Evolução temporal de métricas',
    icon: 'LineChart',
    category: 'chart',
    defaultSize: { w: 6, h: 3 },
    minSize: { w: 4, h: 3 },
  },
  CHART_BAR: {
    name: 'Gráfico de Barras',
    description: 'Comparativo entre campanhas',
    icon: 'BarChart',
    category: 'chart',
    defaultSize: { w: 6, h: 3 },
    minSize: { w: 4, h: 3 },
  },
  CHART_PIE: {
    name: 'Gráfico de Pizza',
    description: 'Distribuição de gastos',
    icon: 'PieChart',
    category: 'chart',
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 3, h: 3 },
  },
  CHART_BURNUP: {
    name: 'Burn-up Chart',
    description: 'Acompanhe o progresso em direção à meta',
    icon: 'TrendingUp',
    category: 'chart',
    defaultSize: { w: 6, h: 4 },
    minSize: { w: 4, h: 3 },
  },
  ACCOUNT_BALANCE: {
    name: 'Saldo da Conta',
    description: 'Saldo disponível nas contas',
    icon: 'Wallet',
    category: 'special',
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 2, h: 2 },
  },
};
