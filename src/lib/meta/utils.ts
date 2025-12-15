import { MetaAction } from '@/types/meta';

export function getActionValue(actions: MetaAction[] | undefined, actionType: string): number {
  if (!actions) return 0;
  const action = actions.find((a) => a.action_type === actionType);
  return action ? parseFloat(action.value) : 0;
}

export function getActionValueSum(actions: MetaAction[] | undefined, actionTypes: string[]): number {
  if (!actions) return 0;
  return actions
    .filter((a) => actionTypes.includes(a.action_type))
    .reduce((sum, a) => sum + parseFloat(a.value), 0);
}

// Lista de action_types que contam como conversão
const CONVERSION_ACTION_TYPES = [
  'purchase',
  'omni_purchase',
  'offsite_conversion.fb_pixel_purchase',
  'onsite_conversion.purchase',
  'complete_registration',
  'omni_complete_registration',
  'offsite_conversion.fb_pixel_complete_registration',
  'lead',
  'omni_lead',
  'offsite_conversion.fb_pixel_lead',
  'add_to_cart',
  'omni_add_to_cart',
  'offsite_conversion.fb_pixel_add_to_cart',
  'initiate_checkout',
  'omni_initiated_checkout',
  'offsite_conversion.fb_pixel_initiate_checkout',
  'contact',
  'submit_application',
  'subscribe',
  'start_trial',
];

// Busca conversões totais de actions (soma todos os tipos de conversão)
export function getTotalConversions(actions: MetaAction[] | undefined): number {
  if (!actions) return 0;

  return actions
    .filter((a) => CONVERSION_ACTION_TYPES.some(type =>
      a.action_type === type || a.action_type.includes(type)
    ))
    .reduce((sum, a) => sum + parseFloat(a.value), 0);
}

// Busca conversões por tipo específico ou padrão (purchase + omni_purchase)
export function getConversions(actions: MetaAction[] | undefined, actionType?: string): number {
  if (!actions) return 0;

  if (actionType) {
    // Busca apenas pelo tipo exato especificado
    const action = actions.find((a) => a.action_type === actionType);
    return action ? parseFloat(action.value) || 0 : 0;
  }

  // Se não especificado, busca purchase (conversões de compra)
  return actions
    .filter((a) =>
      a.action_type === 'purchase' ||
      a.action_type === 'omni_purchase' ||
      a.action_type.includes('purchase')
    )
    .reduce((sum, a) => sum + parseFloat(a.value), 0);
}

export function calculateCPL(spend: number, leads: number): number {
  if (leads === 0) return 0;
  return spend / leads;
}

export function calculateCPA(spend: number, conversions: number): number {
  if (conversions === 0) return 0;
  return spend / conversions;
}

export function calculateROAS(revenue: number, spend: number): number {
  if (spend === 0) return 0;
  return revenue / spend;
}

export function formatCurrency(value: number, currency: string = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat('pt-BR').format(value);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function parseMetricValue(value: string | number | undefined): number {
  if (value === undefined || value === null) return 0;
  if (typeof value === 'number') return value;
  return parseFloat(value) || 0;
}
