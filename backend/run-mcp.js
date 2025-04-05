#!/usr/bin/env node

/**
 * Direct MCP runner script with silent mode
 * This script runs the MCP server with absolutely no output to stdout except JSON-RPC messages
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Create a log file for non-JSON-RPC output
const logFile = fs.createWriteStream(path.join(__dirname, 'mcp-server.log'), { flags: 'a' });
const logTimestamp = () => new Date().toISOString();

// Log function that writes to the log file only, not stdout
const log = (msg) => {
  logFile.write(`${logTimestamp()} ${msg}\n`);
};

// Determine if we're in production mode based on arguments
const isProd = process.argv.includes('--prod');
const scriptPath = isProd
  ? path.join(__dirname, 'dist', 'mcp-server.js')
  : path.join(__dirname, 'src', 'mcp-server.ts');

// Log startup info
log(`Starting MCP server (${isProd ? 'production' : 'development'} mode)...`);

// Set environment variable to signal silent mode
process.env.MCP_SILENT_MODE = 'true';

// Spawn the process with all output to a log file
const command = isProd ? 'node' : path.join(__dirname, 'node_modules', '.bin', 'ts-node');
const args = isProd ? [scriptPath] : [scriptPath];

log(`Running command: ${command} ${args.join(' ')}`);

const proc = spawn(command, args, {
  stdio: ['pipe', 'pipe', 'pipe'], // Pipe all stdio
  env: { ...process.env }
});

// Pipe stdin to the child process
process.stdin.pipe(proc.stdin);

// Pipe stdout directly without modification
proc.stdout.pipe(process.stdout);

// Capture stderr and log to file
proc.stderr.on('data', (data) => {
  log(`[stderr] ${data.toString().trim()}`);
});

// Handle process events
proc.on('error', (err) => {
  log(`Process error: ${err.message}`);
  process.exit(1);
});

proc.on('exit', (code) => {
  log(`MCP server exited with code ${code}`);
  logFile.end();
  process.exit(code);
});

// Handle termination signals
process.on('SIGINT', () => {
  log('Received SIGINT, shutting down...');
  proc.kill('SIGINT');
});

process.on('SIGTERM', () => {
  log('Received SIGTERM, shutting down...');
  proc.kill('SIGTERM');
});

// Log that we're ready
log('MCP runner initialized and ready for JSON-RPC messages');