import { metaApiClient } from '../services/metaApi.js';
import { withCache } from '../utils/cache.js';
import { logger } from '../utils/logger.js';
import { UserToken, ToolResult } from '../types/index.js';
import { z } from 'zod';

export const ListAdsParamsSchema = z.object({
  adset_id: z.string(),
  status: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED', 'ALL']).optional(),
  limit: z.number().optional(),
  fields: z.string().optional(),
});

export type ListAdsParams = z.infer<typeof ListAdsParamsSchema>;

export async function listAdsTool(
  parameters: Record<string, any>,
  user: UserToken
): Promise<ToolResult> {
  // Validar parâmetros
  const params = ListAdsParamsSchema.parse(parameters);

  const { adset_id, status = 'ACTIVE', limit = 25 } = params;

  const cacheKey = `ads:${adset_id}:${status}:${limit}`;
  const cacheTTL = 300; // 5 minutos

  logger.info('Executing list_ads', {
    userId: user.user_id,
    adsetId: adset_id,
    status,
    limit,
  });

  return withCache(
    cacheKey,
    cacheTTL,
    async () => {
      const fields =
        params.fields ||
        'id,name,status,effective_status,creative{id,title,body,image_url,video_id,thumbnail_url}';

      // Construir URL da API
      let url = `https://graph.facebook.com/v21.0/${adset_id}/ads?fields=${fields}&limit=${limit}&access_token=${user.meta_access_token}`;

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
        throw new Error(data.error?.message || 'Failed to fetch ads');
      }

      const ads = data.data.map((ad: any) => ({
        id: ad.id,
        name: ad.name,
        status: ad.status,
        effective_status: ad.effective_status,
        creative: ad.creative
          ? {
              id: ad.creative.id,
              title: ad.creative.title,
              body: ad.creative.body,
              image_url: ad.creative.image_url,
              video_id: ad.creative.video_id,
              thumbnail_url: ad.creative.thumbnail_url,
            }
          : null,
      }));

      logger.info('list_ads completed', {
        userId: user.user_id,
        adsCount: ads.length,
      });

      return ads;
    },
    'list_ads'
  );
}

export default listAdsTool;
