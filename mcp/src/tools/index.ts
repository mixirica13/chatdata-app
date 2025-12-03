import { UserToken, ToolResult, ToolHandler } from '../types/index.js';
import { listAdAccountsTool } from './listAdAccounts.js';
import { listCampaignsTool } from './listCampaigns.js';
import { getCampaignInsightsTool } from './getCampaignInsights.js';
import { getAccountInsightsTool } from './getAccountInsights.js';
import { searchCampaignsTool } from './searchCampaigns.js';
import { listAdsetsTool } from './listAdsets.js';
import { getAdsetInsightsTool } from './getAdsetInsights.js';
import { listAdsTool } from './listAds.js';
import { getAdInsightsTool } from './getAdInsights.js';

/**
 * Registry de todas as tools disponíveis
 */
export const toolRegistry: Record<string, ToolHandler> = {
  list_ad_accounts: listAdAccountsTool,
  list_campaigns: listCampaignsTool,
  get_campaign_insights: getCampaignInsightsTool,
  get_account_insights: getAccountInsightsTool,
  search_campaigns: searchCampaignsTool,
  list_adsets: listAdsetsTool,
  get_adset_insights: getAdsetInsightsTool,
  list_ads: listAdsTool,
  get_ad_insights: getAdInsightsTool,
};

/**
 * Executa uma tool pelo nome
 */
export async function executeTool(
  toolName: string,
  parameters: Record<string, any>,
  user: UserToken
): Promise<ToolResult> {
  const handler = toolRegistry[toolName];

  if (!handler) {
    throw new Error(`Tool '${toolName}' not found`);
  }

  return await handler(parameters, user);
}

/**
 * Lista todas as tools disponíveis
 */
export function listAvailableTools(): string[] {
  return Object.keys(toolRegistry);
}

export default { executeTool, listAvailableTools, toolRegistry };
