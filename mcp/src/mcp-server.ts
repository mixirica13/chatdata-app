/**
 * MCP Server - HTTP Streamable
 * Implementa o Model Context Protocol sobre HTTP com streaming
 * Compatível com n8n MCP Client Tool
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';
import { authenticateMCPRequest } from './middleware/mcpAuth.js';
import { requestLogger } from './middleware/requestLogger.js';
import { MCPProtocolHandler } from './services/mcpProtocol.js';
import { toolAdapter } from './services/toolAdapter.js';
import { JSONRPCRequest } from './types/mcp.js';

const app = express();

// Configuração do protocolo MCP
const mcpConfig = {
  name: 'chatdata-meta-ads-mcp',
  version: '1.0.0',
  protocolVersion: '2024-11-05',
};

const mcpHandler = new MCPProtocolHandler(mcpConfig);

// Middlewares globais
app.use(helmet());
app.use(
  cors({
    origin: config.cors.allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    server: mcpConfig.name,
    version: mcpConfig.version,
    protocol: mcpConfig.protocolVersion,
  });
});

/**
 * Endpoint principal MCP - HTTP Streamable
 * POST /mcp ou POST /meta-ads-mcp
 * Query param: ?token=META_ACCESS_TOKEN
 * Body: JSON-RPC 2.0 request
 */
async function handleMCPRequest(req: Request, res: Response) {
  try {
    const jsonrpcRequest = req.body as JSONRPCRequest;

    // Validar estrutura JSON-RPC
    if (!jsonrpcRequest.jsonrpc || jsonrpcRequest.jsonrpc !== '2.0') {
      return res.status(400).json({
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32600,
          message: 'Invalid Request: Missing or invalid jsonrpc version',
          data: { expected: '2.0' },
        },
      });
    }

    if (!jsonrpcRequest.method) {
      return res.status(400).json({
        jsonrpc: '2.0',
        id: jsonrpcRequest.id || null,
        error: {
          code: -32600,
          message: 'Invalid Request: Missing method',
        },
      });
    }

    logger.info('MCP request received', {
      method: jsonrpcRequest.method,
      id: jsonrpcRequest.id,
      hasParams: !!jsonrpcRequest.params,
    });

    // Tool executor que usa o Meta Access Token diretamente
    const toolExecutor = async (name: string, args: any) => {
      if (!req.metaToken) {
        throw new Error('Meta token not found in request');
      }

      return await toolAdapter.executeTool(name, args, req.metaToken);
    };

    // Processar requisição MCP
    const response = await mcpHandler.processRequest(
      jsonrpcRequest,
      toolExecutor
    );

    // Enviar resposta JSON-RPC
    res.status(200).json(response);
  } catch (error: any) {
    logger.error('MCP request handler error', { error });

    res.status(500).json({
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32603,
        message: 'Internal server error',
        data: {
          error: error.message,
        },
      },
    });
  }
}

// Endpoints MCP com autenticação via query parameter
app.post('/mcp', authenticateMCPRequest, handleMCPRequest);
app.post('/meta-ads-mcp', authenticateMCPRequest, handleMCPRequest);

// Endpoint de informações (sem autenticação)
app.get('/mcp/info', (req, res) => {
  res.json({
    server: mcpConfig.name,
    version: mcpConfig.version,
    protocol: mcpConfig.protocolVersion,
    description: 'Meta Ads MCP Server for Chatdata',
    authentication: {
      type: 'query_parameter',
      parameter: 'token',
      description: 'Meta Ads API access token',
      example: 'https://mcp.chatdata.pro/meta-ads-mcp?token=YOUR_META_ACCESS_TOKEN',
    },
    methods: [
      'initialize',
      'tools/list',
      'tools/call',
      'ping',
    ],
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
    hint: 'Use POST /mcp or POST /meta-ads-mcp with ?token=YOUR_META_ACCESS_TOKEN',
    info: 'GET /mcp/info for server information',
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
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
      data: {
        error: err.message,
      },
    },
  });
});

// Iniciar servidor
const PORT = config.port || 3001;

app.listen(PORT, () => {
  logger.info(`🚀 MCP Server (HTTP Streamable) running on port ${PORT}`);
  logger.info(`Server: ${mcpConfig.name} v${mcpConfig.version}`);
  logger.info(`Protocol: MCP ${mcpConfig.protocolVersion}`);
  logger.info(`Environment: ${config.env}`);
  logger.info(`Endpoint: POST /mcp?token=YOUR_META_ACCESS_TOKEN`);
  logger.info(`Info: GET /mcp/info`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

export default app;
