/**
 * MCP Server - HTTP Streamable (Protocol 2025-11-25)
 * Implementa o Model Context Protocol usando o SDK oficial
 * com suporte a Server-Sent Events (SSE) para streaming bidirecional
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { randomUUID } from 'node:crypto';
import { Server as McpServer } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';
import { authenticateMCPRequest } from './middleware/mcpAuth.js';
import { requestLogger } from './middleware/requestLogger.js';
import { toolAdapter } from './services/toolAdapter.js';

const app = express();

// Configuração do servidor MCP
const MCP_CONFIG = {
  name: 'chatdata-meta-ads-mcp',
  version: '2.0.0',
  protocolVersion: '2025-11-25',
};

// Registry de transports/sessões ativas
const transports: Record<string, StreamableHTTPServerTransport> = {};

// Middlewares globais
app.use(helmet({
  contentSecurityPolicy: false, // Necessário para SSE
}));
app.use(
  cors({
    origin: config.cors.allowedOrigins,
    credentials: true,
    exposedHeaders: ['mcp-session-id'],
  })
);
app.use(express.json());
app.use(requestLogger);

/**
 * Cria uma nova instância do MCP Server com as tools registradas
 */
function createMcpServer(metaToken: {
  access_token: string;
  user_id: string;
  ad_account_ids: string[];
}): McpServer {
  const server = new McpServer(
    {
      name: MCP_CONFIG.name,
      version: MCP_CONFIG.version,
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Handler: tools/list - Lista todas as tools disponíveis
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    logger.info('MCP: tools/list called');

    return {
      tools: [
        {
          name: 'list_ad_accounts',
          description: 'Lista todas as contas de anúncios do Meta Ads conectadas ao usuário',
          inputSchema: {
            type: 'object',
            properties: {
              fields: {
                type: 'string',
                description: 'Campos específicos a retornar (padrão: id,name,currency,account_status)',
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
                description: 'ID da conta de anúncios (opcional, usa primeira conta se não fornecido)',
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
                description: 'ID da conta de anúncios (opcional, usa primeira conta se não fornecido)',
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
                description: 'ID da conta de anúncios (opcional, usa primeira conta se não fornecido)',
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
            },
            required: ['ad_id'],
          },
        },
      ],
    };
  });

  // Handler: tools/call - Executa uma tool
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;

    logger.info('MCP: tools/call', {
      toolName: name,
      args,
      userId: metaToken.user_id,
    });

    try {
      const result = await toolAdapter.executeTool(name, args, metaToken);

      logger.info('MCP: tool executed successfully', {
        toolName: name,
        userId: metaToken.user_id,
        cached: result.metadata?.cached,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      logger.error('MCP: tool execution failed', {
        toolName: name,
        userId: metaToken.user_id,
        error: error.message,
      });

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
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

/**
 * POST /mcp - Enviar mensagens JSON-RPC ao servidor
 */
app.post('/mcp', authenticateMCPRequest, async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    const isInitializeRequest = req.body?.method === 'initialize';

    let transport: StreamableHTTPServerTransport;

    if (sessionId && transports[sessionId]) {
      // Reusar sessão existente
      transport = transports[sessionId];
      logger.info('MCP: Reusing existing session', { sessionId });
    } else if (!sessionId && isInitializeRequest) {
      // Nova sessão - criar transport e server
      logger.info('MCP: Creating new session', {
        method: req.body?.method,
        userId: req.metaToken?.user_id,
      });

      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (id) => {
          transports[id] = transport;
          logger.info('MCP: Session initialized', {
            sessionId: id,
            userId: req.metaToken?.user_id,
          });
        },
        onsessionclosed: (id) => {
          delete transports[id];
          logger.info('MCP: Session closed', { sessionId: id });
        },
      });

      // Cleanup ao fechar transport
      transport.onclose = () => {
        if (transport.sessionId) {
          delete transports[transport.sessionId];
        }
      };

      // Criar e conectar servidor MCP
      const server = createMcpServer(req.metaToken!);
      await server.connect(transport);
    } else {
      // Sessão inválida
      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Invalid session - missing session ID or not an initialize request',
        },
        id: null,
      });
      return;
    }

    // Delegar requisição ao transport
    await transport.handleRequest(req, res, req.body);
  } catch (error: any) {
    logger.error('MCP: POST handler error', { error });
    res.status(500).json({
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32603,
        message: 'Internal server error',
        data: { error: error.message },
      },
    });
  }
});

/**
 * GET /mcp - Iniciar stream SSE para notificações
 */
app.get('/mcp', authenticateMCPRequest, async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = req.headers['mcp-session-id'] as string;

    if (!sessionId || !transports[sessionId]) {
      res.status(400).send('Invalid session - session ID not found');
      return;
    }

    const transport = transports[sessionId];

    logger.info('MCP: SSE stream requested', { sessionId });

    // Delegar ao transport para gerenciar SSE
    await transport.handleRequest(req, res);
  } catch (error: any) {
    logger.error('MCP: GET handler error', { error });
    res.status(500).send('Internal server error');
  }
});

/**
 * DELETE /mcp - Encerrar sessão
 */
app.delete('/mcp', authenticateMCPRequest, async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = req.headers['mcp-session-id'] as string;

    if (!sessionId || !transports[sessionId]) {
      res.status(400).send('Invalid session - session ID not found');
      return;
    }

    const transport = transports[sessionId];

    logger.info('MCP: Session termination requested', { sessionId });

    // Delegar ao transport
    await transport.handleRequest(req, res);
  } catch (error: any) {
    logger.error('MCP: DELETE handler error', { error });
    res.status(500).send('Internal server error');
  }
});

/**
 * Health check
 */
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    server: MCP_CONFIG.name,
    version: MCP_CONFIG.version,
    protocol: MCP_CONFIG.protocolVersion,
    activeSessions: Object.keys(transports).length,
  });
});

/**
 * Informações do servidor (sem autenticação)
 */
app.get('/mcp/info', (_req, res) => {
  res.json({
    server: MCP_CONFIG.name,
    version: MCP_CONFIG.version,
    protocol: MCP_CONFIG.protocolVersion,
    description: 'Meta Ads MCP Server for Chatdata - HTTP Streamable with SSE',
    transport: 'HTTP Streamable (2025-11-25)',
    authentication: {
      type: 'query_parameter',
      parameter: 'token',
      description: 'Meta Ads API access token',
      example: 'https://mcp.chatdata.pro/mcp?token=YOUR_META_ACCESS_TOKEN',
    },
    endpoints: {
      POST: '/mcp - Send JSON-RPC messages',
      GET: '/mcp - Start SSE stream (requires mcp-session-id header)',
      DELETE: '/mcp - Close session (requires mcp-session-id header)',
    },
    tools: [
      'list_ad_accounts',
      'list_campaigns',
      'get_campaign_insights',
      'get_account_insights',
      'search_campaigns',
      'list_adsets',
      'get_adset_insights',
      'list_ads',
      'get_ad_insights',
    ],
    features: [
      'Server-Sent Events (SSE) for bidirectional streaming',
      'Session management with mcp-session-id header',
      'Real-time notifications support',
      'JSON-RPC 2.0 protocol',
      'Meta Ads API integration',
    ],
  });
});

// 404 handler
app.use((req, res) => {
  logger.warn('404 Not Found', {
    path: req.path,
    method: req.method,
  });

  res.status(404).json({
    error: 'Endpoint not found',
    hint: 'Use POST /mcp?token=YOUR_META_ACCESS_TOKEN for initialize',
    info: 'GET /mcp/info for server information',
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, _next: any) => {
  logger.error('Error handler caught error', {
    error: err,
    path: req.path,
  });

  res.status(500).json({
    jsonrpc: '2.0',
    id: null,
    error: {
      code: -32603,
      message: 'Internal server error',
      data: { error: err.message },
    },
  });
});

// Iniciar servidor
const PORT = config.port || 3001;

app.listen(PORT, () => {
  logger.info(`🚀 MCP Server (HTTP Streamable) running on port ${PORT}`);
  logger.info(`Server: ${MCP_CONFIG.name} v${MCP_CONFIG.version}`);
  logger.info(`Protocol: MCP ${MCP_CONFIG.protocolVersion}`);
  logger.info(`Transport: HTTP Streamable with SSE support`);
  logger.info(`Environment: ${config.env}`);
  logger.info(`Endpoint: POST /mcp?token=YOUR_META_ACCESS_TOKEN`);
  logger.info(`Info: GET /mcp/info`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server and sessions');

  // Fechar todas as sessões ativas
  Object.keys(transports).forEach((sessionId) => {
    logger.info('Closing session', { sessionId });
    transports[sessionId].close();
  });

  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server and sessions');

  // Fechar todas as sessões ativas
  Object.keys(transports).forEach((sessionId) => {
    logger.info('Closing session', { sessionId });
    transports[sessionId].close();
  });

  process.exit(0);
});

export default app;
