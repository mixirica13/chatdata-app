import { z } from 'zod';

// User Token Interface
export interface UserToken {
  id: string;
  user_id: string;
  mcp_token: string;
  meta_access_token: string;
  meta_token_expires_at: Date;
  meta_user_id: string;
  meta_user_name: string;
  ad_account_ids: string[];
  created_at: Date;
  updated_at: Date;
}

// Tool Result Interface
export interface ToolResult {
  data: any;
  cached: boolean;
  cache_ttl: number;
}

// Tool Handler Type
export type ToolHandler = (
  parameters: Record<string, any>,
  user: UserToken
) => Promise<ToolResult>;

// Error Codes
export enum ErrorCode {
  // Autenticação
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  // Validação
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_TOOL = 'INVALID_TOOL',
  MISSING_PARAMETER = 'MISSING_PARAMETER',

  // Meta API
  META_API_ERROR = 'META_API_ERROR',
  META_RATE_LIMIT = 'META_RATE_LIMIT',
  META_PERMISSION_DENIED = 'META_PERMISSION_DENIED',

  // Rate Limit
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  USER_RATE_LIMIT_EXCEEDED = 'USER_RATE_LIMIT_EXCEEDED',

  // Geral
  SERVER_ERROR = 'SERVER_ERROR',
  EXECUTION_ERROR = 'EXECUTION_ERROR',
}

// API Error Interface
export interface APIError {
  success: false;
  error: string;
  code: ErrorCode;
  details?: any;
}

// Tool Request Schema
export const ToolRequestSchema = z.object({
  tool: z.enum([
    'list_ad_accounts',
    'list_campaigns',
    'get_campaign_insights',
    'get_account_insights',
    'search_campaigns',
  ]),
  parameters: z.record(z.any()).optional(),
});

export type ToolRequest = z.infer<typeof ToolRequestSchema>;

// Tool Parameters Schemas
export const ListAdAccountsParamsSchema = z.object({
  fields: z.string().optional(),
});

export const ListCampaignsParamsSchema = z.object({
  ad_account_id: z.string().optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED', 'ALL']).optional(),
  limit: z.number().optional(),
  fields: z.string().optional(),
});

export const GetCampaignInsightsParamsSchema = z.object({
  campaign_id: z.string(),
  date_preset: z
    .enum(['today', 'yesterday', 'last_7d', 'last_30d', 'lifetime'])
    .optional(),
  time_range: z
    .object({
      since: z.string(),
      until: z.string(),
    })
    .optional(),
  fields: z.string().optional(),
});

export const GetAccountInsightsParamsSchema = z.object({
  ad_account_id: z.string().optional(),
  date_preset: z.string().optional(),
  level: z.enum(['account', 'campaign', 'adset', 'ad']).optional(),
  breakdowns: z.array(z.string()).optional(),
});

export const SearchCampaignsParamsSchema = z.object({
  ad_account_id: z.string().optional(),
  query: z.string(),
  limit: z.number().optional(),
});

export const ListAdsetsParamsSchema = z.object({
  campaign_id: z.string(),
  status: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED', 'ALL']).optional(),
  limit: z.number().optional(),
  fields: z.string().optional(),
});

export const GetAdsetInsightsParamsSchema = z.object({
  adset_id: z.string(),
  date_preset: z
    .enum(['today', 'yesterday', 'last_7d', 'last_30d', 'lifetime'])
    .optional(),
  time_range: z
    .object({
      since: z.string(),
      until: z.string(),
    })
    .optional(),
  fields: z.string().optional(),
});

export const ListAdsParamsSchema = z.object({
  adset_id: z.string(),
  status: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED', 'ALL']).optional(),
  limit: z.number().optional(),
  fields: z.string().optional(),
});

export const GetAdInsightsParamsSchema = z.object({
  ad_id: z.string(),
  date_preset: z
    .enum(['today', 'yesterday', 'last_7d', 'last_30d', 'lifetime'])
    .optional(),
  time_range: z
    .object({
      since: z.string(),
      until: z.string(),
    })
    .optional(),
  fields: z.string().optional(),
});

export type ListAdAccountsParams = z.infer<typeof ListAdAccountsParamsSchema>;
export type ListCampaignsParams = z.infer<typeof ListCampaignsParamsSchema>;
export type GetCampaignInsightsParams = z.infer<typeof GetCampaignInsightsParamsSchema>;
export type GetAccountInsightsParams = z.infer<typeof GetAccountInsightsParamsSchema>;
export type SearchCampaignsParams = z.infer<typeof SearchCampaignsParamsSchema>;
export type ListAdsetsParams = z.infer<typeof ListAdsetsParamsSchema>;
export type GetAdsetInsightsParams = z.infer<typeof GetAdsetInsightsParamsSchema>;
export type ListAdsParams = z.infer<typeof ListAdsParamsSchema>;
export type GetAdInsightsParams = z.infer<typeof GetAdInsightsParamsSchema>;

// Express Request Extension
declare global {
  namespace Express {
    interface Request {
      user?: UserToken;
    }
  }
}
