/**
 * Simple test script for MCP service
 */
console.log('MCP test - This script validates the MCP module can be loaded');

import { McpService } from './services/mcp.service';

// Just test module loading, don't attempt to connect which requires I/O mocking
console.log('MCP service class loaded successfully');
console.log('Test complete - For real testing, use MCP Inspector:');
console.log('npm install -g @modelcontextprotocol/inspector');
console.log('npm run mcp | mcp-inspector');