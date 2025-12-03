import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';
import { register } from './utils/metrics.js';
import { authenticateMCPToken } from './middleware/auth.js';
import { apiLimiter, userLimiter } from './middleware/rateLimit.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { executeTool, listAvailableTools } from './tools/index.js';
import { ToolRequestSchema } from './types/index.js';
import { toolCallsCounter, toolLatencyHistogram } from './utils/metrics.js';

const app = express();

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
app.use(apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Métricas (Prometheus)
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    logger.error('Error getting metrics', { error });
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

// Info sobre as tools disponíveis
app.get('/api/v1/tools', (req, res) => {
  res.json({
    success: true,
    tools: listAvailableTools(),
    version: '1.0.0',
  });
});

// Endpoint principal: POST /api/v1/tools/call
app.post(
  '/api/v1/tools/call',
  authenticateMCPToken,
  userLimiter,
  async (req, res, next) => {
    const startTime = Date.now();
    let toolName: string | undefined;

    try {
      // Validar requisição
      const { tool, parameters } = ToolRequestSchema.parse(req.body);
      toolName = tool;

      logger.info('Tool execution started', {
        tool,
        user_id: req.user?.id,
        parameters,
      });

      // Executar tool
      const result = await executeTool(tool, parameters || {}, req.user!);

      const executionTimeMs = Date.now() - startTime;
      const executionTimeSec = executionTimeMs / 1000;

      // Registrar métricas
      toolCallsCounter.inc({ tool, status: 'success' });
      toolLatencyHistogram.observe({ tool }, executionTimeSec);

      logger.info('Tool execution completed', {
        tool,
        user_id: req.user?.id,
        execution_time_ms: executionTimeMs,
        cached: result.cached,
      });

      return res.status(200).json({
        success: true,
        tool,
        data: result.data,
        metadata: {
          cached: result.cached,
          cache_ttl: result.cache_ttl,
          execution_time_ms: executionTimeMs,
        },
      });
    } catch (error: any) {
      const executionTimeMs = Date.now() - startTime;

      if (toolName) {
        toolCallsCounter.inc({ tool: toolName, status: 'error' });
      }

      logger.error('Tool execution failed', {
        tool: toolName,
        user_id: req.user?.id,
        execution_time_ms: executionTimeMs,
        error,
      });

      next(error);
    }
  }
);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Iniciar servidor
const PORT = config.port || 3001;

app.listen(PORT, () => {
  logger.info(`🚀 MCP Server running on port ${PORT}`);
  logger.info(`Environment: ${config.env}`);
  logger.info(`Meta API Version: ${config.meta.apiVersion}`);
  logger.info(`Available tools: ${listAvailableTools().join(', ')}`);
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
