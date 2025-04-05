/**
 * MCP Server entry point
 * This script starts the MCP server to provide EC2 pricing data through Model Context Protocol
 */
import { McpService } from './services/mcp.service';
import * as fs from 'fs';
import * as path from 'path';

// Check if we're in silent mode
const silentMode = process.env.MCP_SILENT_MODE === 'true';

// Create a logger that either logs to stderr or a file based on mode
const logger = {
  log: (...args: any[]) => {
    if (silentMode) {
      // Do nothing - logs handled by parent process
      return;
    } else {
      process.stderr.write(`[MCP] ${args.join(' ')}\n`);
    }
  },
  error: (...args: any[]) => {
    if (silentMode) {
      // Do nothing - logs handled by parent process
      return;
    } else {
      process.stderr.write(`[MCP] ${args.join(' ')}\n`);
    }
  }
};

// Override console methods to use our logger
console.log = logger.log;
console.error = logger.error;

// Start the MCP server
logger.log('Starting MCP server...');

McpService.start()
  .then(() => logger.log('MCP server running'))
  .catch(err => {
    logger.error('Failed to start MCP server:', err);
    process.exit(1);
  });