/**
 * MCP Protocol Handler
 * Implements the Model Context Protocol over HTTP with SSE
 */

import {
  JSONRPCRequest,
  JSONRPCResponse,
  JSONRPCError,
  JSONRPCErrorCode,
  InitializeRequest,
  InitializeResult,
  ListToolsResult,
  CallToolRequest,
  CallToolResult,
  Tool,
  MCPServerConfig,
} from '../types/mcp.js';
import { logger } from '../utils/logger.js';

export class MCPProtocolHandler {
  private config: MCPServerConfig;

  constructor(config: MCPServerConfig) {
    this.config = config;
  }

  /**
   * Handle initialize request
   */
  handleInitialize(params: InitializeRequest): InitializeResult {
    logger.info('MCP Initialize', {
      clientName: params.clientInfo.name,
      clientVersion: params.clientInfo.version,
      protocolVersion: params.protocolVersion,
    });

    return {
      protocolVersion: this.config.protocolVersion,
      capabilities: {
        tools: {
          listChanged: false,
        },
      },
      serverInfo: {
        name: this.config.name,
        version: this.config.version,
      },
    };
  }

  /**
   * List all available tools
   */
  handleListTools(): ListToolsResult {
    const tools: Tool[] = [
      {
        name: 'list_ad_accounts',
        description:
          'Lista todas as contas de anúncios do Meta Ads conectadas ao usuário',
        inputSchema: {
          type: 'object',
          properties: {
            fields: {
              type: 'string',
              description:
                'Campos específicos a retornar (padrão: id,name,currency,account_status)',
            },
          },
        },
      },
      {
        name: 'list_campaigns',
        description: 'Lista campanhas de uma conta de anúncios do Meta Ads',
        inputSchema: {
          type: 'object',
          properties: {
            ad_account_id: {
              type: 'string',
              description:
                'ID da conta de anúncios (opcional, usa primeira conta se não fornecido)',
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'PAUSED', 'ARCHIVED', 'ALL'],
              description: 'Filtrar por status (padrão: ACTIVE)',
            },
            limit: {
              type: 'number',
              description: 'Número máximo de campanhas a retornar (padrão: 25)',
            },
          },
        },
      },
      {
        name: 'get_campaign_insights',
        description: 'Busca insights e métricas de uma campanha específica',
        inputSchema: {
          type: 'object',
          properties: {
            campaign_id: {
              type: 'string',
              description: 'ID da campanha',
            },
            date_preset: {
              type: 'string',
              enum: ['today', 'yesterday', 'last_7d', 'last_30d', 'lifetime'],
              description: 'Período pré-definido (padrão: last_7d)',
            },
            time_range: {
              type: 'object',
              description: 'Período customizado',
              properties: {
                since: {
                  type: 'string',
                  description: 'Data inicial (YYYY-MM-DD)',
                },
                until: {
                  type: 'string',
                  description: 'Data final (YYYY-MM-DD)',
                },
              },
            },
          },
          required: ['campaign_id'],
        },
      },
      {
        name: 'get_account_insights',
        description: 'Busca insights e métricas de uma conta de anúncios',
        inputSchema: {
          type: 'object',
          properties: {
            ad_account_id: {
              type: 'string',
              description:
                'ID da conta de anúncios (opcional, usa primeira conta se não fornecido)',
            },
            date_preset: {
              type: 'string',
              description: 'Período pré-definido (padrão: last_7d)',
            },
            level: {
              type: 'string',
              enum: ['account', 'campaign', 'adset', 'ad'],
              description: 'Nível de agregação (padrão: account)',
            },
            breakdowns: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Dimensões para quebrar os dados (ex: age, gender)',
            },
          },
        },
      },
      {
        name: 'search_campaigns',
        description: 'Busca campanhas por nome',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Termo de busca',
            },
            ad_account_id: {
              type: 'string',
              description:
                'ID da conta de anúncios (opcional, usa primeira conta se não fornecido)',
            },
            limit: {
              type: 'number',
              description: 'Número máximo de resultados (padrão: 10)',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'list_adsets',
        description: 'Lista conjuntos de anúncios (adsets) de uma campanha',
        inputSchema: {
          type: 'object',
          properties: {
            campaign_id: {
              type: 'string',
              description: 'ID da campanha',
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'PAUSED', 'ARCHIVED', 'ALL'],
              description: 'Filtrar por status (padrão: ACTIVE)',
            },
            limit: {
              type: 'number',
              description: 'Número máximo de adsets a retornar (padrão: 25)',
            },
            fields: {
              type: 'string',
              description:
                'Campos específicos a retornar',
            },
          },
          required: ['campaign_id'],
        },
      },
      {
        name: 'get_adset_insights',
        description: 'Busca insights e métricas de um conjunto de anúncios (adset) específico',
        inputSchema: {
          type: 'object',
          properties: {
            adset_id: {
              type: 'string',
              description: 'ID do adset',
            },
            date_preset: {
              type: 'string',
              enum: ['today', 'yesterday', 'last_7d', 'last_30d', 'lifetime'],
              description: 'Período pré-definido (padrão: last_7d)',
            },
            time_range: {
              type: 'object',
              description: 'Período customizado',
              properties: {
                since: {
                  type: 'string',
                  description: 'Data inicial (YYYY-MM-DD)',
                },
                until: {
                  type: 'string',
                  description: 'Data final (YYYY-MM-DD)',
                },
              },
            },
            fields: {
              type: 'string',
              description: 'Campos de métricas específicos a retornar',
            },
          },
          required: ['adset_id'],
        },
      },
      {
        name: 'list_ads',
        description: 'Lista anúncios de um conjunto de anúncios (adset)',
        inputSchema: {
          type: 'object',
          properties: {
            adset_id: {
              type: 'string',
              description: 'ID do adset',
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'PAUSED', 'ARCHIVED', 'ALL'],
              description: 'Filtrar por status (padrão: ACTIVE)',
            },
            limit: {
              type: 'number',
              description: 'Número máximo de anúncios a retornar (padrão: 25)',
            },
            fields: {
              type: 'string',
              description: 'Campos específicos a retornar',
            },
          },
          required: ['adset_id'],
        },
      },
      {
        name: 'get_ad_insights',
        description: 'Busca insights e métricas de um anúncio específico',
        inputSchema: {
          type: 'object',
          properties: {
            ad_id: {
              type: 'string',
              description: 'ID do anúncio',
            },
            date_preset: {
              type: 'string',
              enum: ['today', 'yesterday', 'last_7d', 'last_30d', 'lifetime'],
              description: 'Período pré-definido (padrão: last_7d)',
            },
            time_range: {
              type: 'object',
              description: 'Período customizado',
              properties: {
                since: {
                  type: 'string',
                  description: 'Data inicial (YYYY-MM-DD)',
                },
                until: {
                  type: 'string',
                  description: 'Data final (YYYY-MM-DD)',
                },
              },
            },
            fields: {
              type: 'string',
              description: 'Campos de métricas específicos a retornar',
            },
          },
          required: ['ad_id'],
        },
      },
    ];

    logger.info('MCP ListTools', { toolsCount: tools.length });

    return { tools };
  }

  /**
   * Handle tool call
   */
  async handleCallTool(
    params: CallToolRequest,
    toolExecutor: (name: string, args: any) => Promise<any>
  ): Promise<CallToolResult> {
    try {
      const { name, arguments: args = {} } = params;

      logger.info('MCP CallTool', { toolName: name, args });

      // Execute the tool
      const result = await toolExecutor(name, args);

      // Format result as MCP response
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      logger.error('MCP CallTool error', { error });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                error: error.message || 'Tool execution failed',
                code: error.code || 'EXECUTION_ERROR',
              },
              null,
              2
            ),
          }
        ],
        isError: true,
      };
    }
  }

  /**
   * Create JSON-RPC response
   */
  createResponse(id: string | number | null, result: any): JSONRPCResponse {
    return {
      jsonrpc: '2.0',
      id,
      result,
    };
  }

  /**
   * Create JSON-RPC error response
   */
  createErrorResponse(
    id: string | number | null,
    code: JSONRPCErrorCode,
    message: string,
    data?: any
  ): JSONRPCResponse {
    const error: JSONRPCError = {
      code,
      message,
      ...(data && { data }),
    };

    return {
      jsonrpc: '2.0',
      id,
      error,
    };
  }

  /**
   * Process JSON-RPC request
   */
  async processRequest(
    request: JSONRPCRequest,
    toolExecutor: (name: string, args: any) => Promise<any>
  ): Promise<JSONRPCResponse> {
    const { id, method, params } = request;

    try {
      switch (method) {
        case 'initialize':
          const initResult = this.handleInitialize(params as InitializeRequest);
          return this.createResponse(id || null, initResult);

        case 'tools/list':
          const listResult = this.handleListTools();
          return this.createResponse(id || null, listResult);

        case 'tools/call':
          const callResult = await this.handleCallTool(
            params as CallToolRequest,
            toolExecutor
          );
          return this.createResponse(id || null, callResult);

        case 'ping':
          return this.createResponse(id || null, {});

        default:
          return this.createErrorResponse(
            id || null,
            JSONRPCErrorCode.METHOD_NOT_FOUND,
            `Method not found: ${method}`
          );
      }
    } catch (error: any) {
      logger.error('MCP processRequest error', { error, method });

      return this.createErrorResponse(
        id || null,
        JSONRPCErrorCode.INTERNAL_ERROR,
        error.message || 'Internal server error',
        { originalError: error.toString() }
      );
    }
  }
}

export default MCPProtocolHandler;
