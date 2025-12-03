/**
 * Model Context Protocol (MCP) Types
 * Based on MCP specification for HTTP transport with SSE
 */

// JSON-RPC 2.0 Types
export interface JSONRPCRequest {
  jsonrpc: '2.0';
  id?: string | number;
  method: string;
  params?: any;
}

export interface JSONRPCResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: any;
  error?: JSONRPCError;
}

export interface JSONRPCError {
  code: number;
  message: string;
  data?: any;
}

// MCP Protocol Messages
export interface InitializeRequest {
  protocolVersion: string;
  capabilities: {
    tools?: {};
  };
  clientInfo: {
    name: string;
    version: string;
  };
}

export interface InitializeResult {
  protocolVersion: string;
  capabilities: {
    tools?: {
      listChanged?: boolean;
    };
  };
  serverInfo: {
    name: string;
    version: string;
  };
}

export interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties?: Record<string, any>;
    required?: string[];
  };
}

export interface ListToolsResult {
  tools: Tool[];
}

export interface CallToolRequest {
  name: string;
  arguments?: Record<string, any>;
}

export interface CallToolResult {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
}

// Server Types
export interface MCPServerConfig {
  name: string;
  version: string;
  protocolVersion: string;
}

export interface TokenValidation {
  valid: boolean;
  access_token?: string;
  user_id?: string;
  ad_account_ids?: string[];
  error?: string;
}

// Error Codes (JSON-RPC 2.0)
export enum JSONRPCErrorCode {
  PARSE_ERROR = -32700,
  INVALID_REQUEST = -32600,
  METHOD_NOT_FOUND = -32601,
  INVALID_PARAMS = -32602,
  INTERNAL_ERROR = -32603,

  // Custom MCP errors
  UNAUTHORIZED = -32000,
  FORBIDDEN = -32001,
  NOT_FOUND = -32002,
  RATE_LIMIT = -32003,
}
