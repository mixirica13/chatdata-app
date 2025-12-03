import { logger } from '../utils/logger.js';
import {
  UserToken,
  ToolResult,
  SearchCampaignsParams,
  SearchCampaignsParamsSchema,
} from '../types/index.js';
import { listCampaignsTool } from './listCampaigns.js';

/**
 * Calcula a relevância de um nome de campanha em relação à query
 */
function calculateRelevance(name: string, query: string): number {
  const nameLower = name.toLowerCase();
  const queryLower = query.toLowerCase();

  // Exact match
  if (nameLower === queryLower) return 1.0;

  // Starts with query
  if (nameLower.startsWith(queryLower)) return 0.9;

  // Contains query
  if (nameLower.includes(queryLower)) return 0.7;

  // Fuzzy match (simplified)
  const words = queryLower.split(' ');
  const matchedWords = words.filter((word) => nameLower.includes(word));
  return (matchedWords.length / words.length) * 0.5;
}

export async function searchCampaignsTool(
  parameters: Record<string, any>,
  user: UserToken
): Promise<ToolResult> {
  // Validar parâmetros
  const params = SearchCampaignsParamsSchema.parse(parameters);

  const adAccountId = params.ad_account_id || user.ad_account_ids[0];
  const query = params.query.toLowerCase();
  const limit = params.limit || 10;

  logger.info('Executing search_campaigns', {
    userId: user.user_id,
    adAccountId,
    query,
    limit,
  });

  // Buscar todas as campanhas (do cache se possível)
  const allCampaigns = await listCampaignsTool(
    {
      ad_account_id: adAccountId,
      status: 'ALL',
      limit: 100,
    },
    user
  );

  // Filtrar por query e ordenar por relevância
  const filtered = (allCampaigns.data as any[])
    .filter((campaign: any) => campaign.name.toLowerCase().includes(query))
    .slice(0, limit)
    .map((campaign: any) => ({
      ...campaign,
      relevance_score: calculateRelevance(campaign.name, query),
    }))
    .sort((a: any, b: any) => b.relevance_score - a.relevance_score);

  logger.info('search_campaigns completed', {
    userId: user.user_id,
    query,
    resultsCount: filtered.length,
  });

  return {
    data: filtered,
    cached: allCampaigns.cached,
    cache_ttl: 300,
  };
}

export default searchCampaignsTool;
