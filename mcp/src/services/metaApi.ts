import Bottleneck from 'bottleneck';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { metaApiCallsCounter } from '../utils/metrics.js';

/**
 * Limiter para Meta API
 * Meta permite ~200 chamadas por hora por usuário
 */
const metaApiLimiter = new Bottleneck({
  reservoir: 200, // Número inicial de chamadas
  reservoirRefreshAmount: 200,
  reservoirRefreshInterval: 60 * 60 * 1000, // 1 hora em ms
  maxConcurrent: 5, // Máximo de 5 chamadas simultâneas
  minTime: 100, // Mínimo 100ms entre chamadas
});

export interface MetaAPIError {
  message: string;
  type: string;
  code: number;
  error_subcode?: number;
  fbtrace_id?: string;
}

export class MetaAPIClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `https://graph.facebook.com/${config.meta.apiVersion}`;
  }

  /**
   * Faz uma chamada à Meta Graph API
   */
  async call(
    endpoint: string,
    accessToken: string,
    params: Record<string, any> = {}
  ): Promise<any> {
    const url = this.buildUrl(endpoint, accessToken, params);

    return metaApiLimiter.schedule(async () => {
      try {
        logger.debug('Meta API call', { endpoint, params });

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          const error = data.error as MetaAPIError;
          metaApiCallsCounter.inc({ endpoint, status: 'error' });

          // Verificar se é erro de rate limit
          if (error.code === 4 || error.code === 17) {
            logger.warn('Meta API rate limit hit', { endpoint, error });
            throw new Error('META_RATE_LIMIT');
          }

          // Erro de permissão
          if (error.code === 200 || error.code === 190) {
            logger.error('Meta API permission error', { endpoint, error });
            throw new Error('META_PERMISSION_DENIED');
          }

          logger.error('Meta API error', { endpoint, error });
          throw new Error(error.message || 'Meta API error');
        }

        metaApiCallsCounter.inc({ endpoint, status: 'success' });
        logger.debug('Meta API call successful', { endpoint });

        return data;
      } catch (error) {
        logger.error('Meta API call failed', { endpoint, error });
        throw error;
      }
    });
  }

  /**
   * Constrói a URL com parâmetros
   */
  private buildUrl(
    endpoint: string,
    accessToken: string,
    params: Record<string, any>
  ): string {
    const url = new URL(`${this.baseUrl}/${endpoint}`);
    url.searchParams.append('access_token', accessToken);

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          url.searchParams.append(key, JSON.stringify(value));
        } else {
          url.searchParams.append(key, String(value));
        }
      }
    }

    return url.toString();
  }

  /**
   * Lista contas de anúncios do usuário
   */
  async getAdAccounts(accessToken: string, fields?: string): Promise<any> {
    const defaultFields = 'id,name,currency,account_status,timezone_name';
    return this.call('me/adaccounts', accessToken, {
      fields: fields || defaultFields,
    });
  }

  /**
   * Lista campanhas de uma conta de anúncios
   */
  async getCampaigns(
    adAccountId: string,
    accessToken: string,
    params: {
      fields?: string;
      limit?: number;
      filtering?: any;
    } = {}
  ): Promise<any> {
    const defaultFields = 'id,name,status,objective,daily_budget,effective_status';
    return this.call(`${adAccountId}/campaigns`, accessToken, {
      fields: params.fields || defaultFields,
      limit: params.limit || 25,
      filtering: params.filtering,
    });
  }

  /**
   * Busca insights de uma campanha
   */
  async getCampaignInsights(
    campaignId: string,
    accessToken: string,
    params: {
      fields?: string;
      date_preset?: string;
      time_range?: { since: string; until: string };
    } = {}
  ): Promise<any> {
    const defaultFields =
      'campaign_id,campaign_name,impressions,clicks,spend,ctr,cpc,cpm,reach,frequency,actions';

    return this.call(`${campaignId}/insights`, accessToken, {
      fields: params.fields || defaultFields,
      date_preset: params.date_preset,
      time_range: params.time_range,
    });
  }

  /**
   * Busca insights de uma conta de anúncios
   */
  async getAccountInsights(
    adAccountId: string,
    accessToken: string,
    params: {
      fields?: string;
      date_preset?: string;
      level?: string;
      breakdowns?: string[];
    } = {}
  ): Promise<any> {
    const defaultFields =
      'impressions,clicks,spend,ctr,cpc,cpm,reach,frequency,actions,cost_per_action_type';

    return this.call(`${adAccountId}/insights`, accessToken, {
      fields: params.fields || defaultFields,
      date_preset: params.date_preset || 'last_7d',
      level: params.level || 'account',
      breakdowns: params.breakdowns?.join(','),
    });
  }
}

export const metaApiClient = new MetaAPIClient();
export default metaApiClient;
