import promClient from 'prom-client';

// Create a Registry
export const register = new promClient.Registry();

// Add default metrics
promClient.collectDefaultMetrics({ register });

// Custom metrics
export const toolCallsCounter = new promClient.Counter({
  name: 'mcp_tool_calls_total',
  help: 'Total number of tool calls',
  labelNames: ['tool', 'status'],
  registers: [register],
});

export const toolLatencyHistogram = new promClient.Histogram({
  name: 'mcp_tool_latency_seconds',
  help: 'Tool execution latency in seconds',
  labelNames: ['tool'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register],
});

export const cacheHitCounter = new promClient.Counter({
  name: 'mcp_cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['tool'],
  registers: [register],
});

export const cacheMissCounter = new promClient.Counter({
  name: 'mcp_cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['tool'],
  registers: [register],
});

export const metaApiCallsCounter = new promClient.Counter({
  name: 'mcp_meta_api_calls_total',
  help: 'Total number of Meta API calls',
  labelNames: ['endpoint', 'status'],
  registers: [register],
});

export const activeUsersGauge = new promClient.Gauge({
  name: 'mcp_active_users',
  help: 'Number of active users',
  registers: [register],
});

export default register;
