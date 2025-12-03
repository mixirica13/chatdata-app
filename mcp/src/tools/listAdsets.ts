import { metaApiClient } from '../services/metaApi.js';
import { withCache } from '../utils/cache.js';
import { logger } from '../utils/logger.js';
import { UserToken, ToolResult } from '../types/index.js';
import { z } from 'zod';

export const ListAdsetsParamsSchema = z.object({
  campaign_id: z.string(),
  status: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED', 'ALL']).optional(),
  limit: z.number().optional(),
  fields: z.string().optional(),
});

export type ListAdsetsParams = z.infer<typeof ListAdsetsParamsSchema>;

export async function listAdsetsTool(
  parameters: Record<string, any>,
  user: UserToken
): Promise<ToolResult> {
  // Validar parâmetros
  const params = ListAdsetsParamsSchema.parse(parameters);

  const { campaign_id, status = 'ACTIVE', limit = 25 } = params;

  const cacheKey = `adsets:${campaign_id}:${status}:${limit}`;
  const cacheTTL = 300; // 5 minutos

  logger.info('Executing list_adsets', {
    userId: user.user_id,
    campaignId: campaign_id,
    status,
    limit,
  });

  return withCache(
    cacheKey,
    cacheTTL,
    async () => {
      const fields =
        params.fields ||
        'id,name,status,effective_status,optimization_goal,daily_budget,bid_amount,targeting';

      // Construir URL da API
      let url = `https://graph.facebook.com/v21.0/${campaign_id}/adsets?fields=${fields}&limit=${limit}&access_token=${user.meta_access_token}`;

      // Adicionar filtro de status se não for ALL
      if (status !== 'ALL') {
        const filtering = JSON.stringify([
          {
            field: 'effective_status',
            operator: 'IN',
            value: [status],
          },
        ]);
        url += `&filtering=${encodeURIComponent(filtering)}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error?.message || 'Failed to fetch adsets'
        );
      }

      const adsets = data.data.map((adset: any) => ({
        id: adset.id,
        name: adset.name,
        status: adset.status,
        effective_status: adset.effective_status,
        optimization_goal: adset.optimization_goal,
        daily_budget: adset.daily_budget
          ? parseFloat(adset.daily_budget) / 100
          : null,
        bid_amount: adset.bid_amount ? parseFloat(adset.bid_amount) / 100 : null,
        targeting: adset.targeting,
      }));

      logger.info('list_adsets completed', {
        userId: user.user_id,
        adsetsCount: adsets.length,
      });

      return adsets;
    },
    'list_adsets'
  );
}

export default listAdsetsTool;
