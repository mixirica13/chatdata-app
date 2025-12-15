export const META_API_VERSION = 'v21.0';
export const META_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

export const INSIGHTS_FIELDS = [
  'spend',
  'impressions',
  'clicks',
  'reach',
  'cpc',
  'cpm',
  'ctr',
  'actions',
  'action_values',
  'conversions',
  'cost_per_action_type',
  'frequency',
];

export const CAMPAIGN_FIELDS = [
  'id',
  'name',
  'status',
  'effective_status',
  'objective',
  'daily_budget',
  'lifetime_budget',
  'created_time',
];

export const ADSET_FIELDS = [
  'id',
  'name',
  'status',
  'effective_status',
  'daily_budget',
  'lifetime_budget',
  'optimization_goal',
  'targeting',
];

export const AD_FIELDS = [
  'id',
  'name',
  'status',
  'effective_status',
  'creative',
  'created_time',
];

export const ACCOUNT_FIELDS = [
  'id',
  'name',
  'currency',
  'account_status',
  'balance',
  'amount_spent',
  'spend_cap',
  'business_name',
];

export const ACTION_TYPES = {
  LEAD: 'lead',
  PURCHASE: 'purchase',
  ADD_TO_CART: 'add_to_cart',
  COMPLETE_REGISTRATION: 'complete_registration',
  CONTACT: 'contact',
  LINK_CLICK: 'link_click',
  LANDING_PAGE_VIEW: 'landing_page_view',
  PAGE_ENGAGEMENT: 'page_engagement',
  POST_ENGAGEMENT: 'post_engagement',
  VIDEO_VIEW: 'video_view',
  OMNI_PURCHASE: 'omni_purchase',
  OMNI_ADD_TO_CART: 'omni_add_to_cart',
  OMNI_INITIATED_CHECKOUT: 'omni_initiated_checkout',
} as const;

export const ACCOUNT_STATUS_MAP: Record<number, string> = {
  1: 'Ativa',
  2: 'Desativada',
  3: 'Não aprovada',
  7: 'Pendente de revisão',
  8: 'Pendente de encerramento',
  9: 'Conta em espera',
  100: 'Pendente de configuração',
  101: 'Qualquer conta ativa',
  102: 'Qualquer conta fechada',
};
