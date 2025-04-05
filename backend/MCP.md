# Model Context Protocol Integration

This document explains how to use the Model Context Protocol (MCP) integration with the EC2 Price Comparison tool.

## Overview

The MCP integration allows Large Language Models (LLMs) to interact with the EC2 pricing data through a standardized protocol. This enables AI assistants to fetch real-time EC2 pricing information, compare instance types, and provide users with cost optimization recommendations.

## Running the MCP Server

To start the MCP server:

```bash
# Development mode through npm (may have npm output issues with inspectors)
npm run mcp

# Production mode through npm (may have npm output issues with inspectors)
npm run mcp:prod

# Direct execution (recommended for use with MCP Inspector)
node run-mcp.js

# Direct execution in production mode (recommended for use with MCP Inspector)
node run-mcp.js --prod
```

The MCP server runs using stdio transport, making it suitable for integration with LLMs that support the Model Context Protocol.

## Debug with MCP Inspector

You can debug the MCP server using the MCP Inspector tool:

```bash
# Install MCP Inspector
npm install -g @modelcontextprotocol/inspector

# Start MCP server and pipe to inspector (direct method recommended)
node run-mcp.js | mcp-inspector

# Or for production version
node run-mcp.js --prod | mcp-inspector

# If using npm (may show npm output errors in inspector)
npm run mcp | mcp-inspector
```

The MCP Inspector will show the messages exchanged between the client and server, helping to diagnose any issues.

## Available Resources and Tools

### Resources

- `ec2://instance-types` - Lists all available EC2 instance types
- `ec2://exchange-rate` - Returns the CNY to USD exchange rate
- `ec2://supported-regions` - Lists all supported AWS regions, explicitly including China regions

### Tools

- `getInstancePrices` - Fetches prices for EC2 instances
  - Parameters:
    - `instanceType`: string - The EC2 instance type (e.g., "t3.micro")
    - `regions`: string[] (optional) - Array of AWS region codes
    - `priceType`: "onDemand" | "reserved1y" | "reserved3y" (optional)

- `getInstanceSpecs` - Retrieves specifications for an EC2 instance type
  - Parameters:
    - `instanceType`: string - The EC2 instance type (e.g., "t3.micro")
    - `region`: string (optional) - AWS region code, defaults to "us-east-1"

- `findCheapestRegion` - Finds the cheapest AWS region for a specific instance type with automatic USD conversion
  - Parameters:
    - `instanceType`: string - The EC2 instance type to check (e.g., "t3.micro")
    - `priceType`: "onDemand" | "reserved1y" | "reserved3y" (optional)
  - Returns all prices converted to USD for fair comparison, with regions sorted by price

### Prompts

- `compare-prices` - Compare EC2 instance prices across AWS regions including China regions
  - Provides a conversation template guiding the LLM to use the `getInstancePrices` tool
  - Helps users create formatted price comparisons
  - Explicitly supports and mentions China regions (Beijing and Ningxia)

- `instance-specs` - Get detailed specifications for an EC2 instance type
  - Provides a conversation template guiding the LLM to use the `getInstanceSpecs` tool
  - Helps users retrieve and format instance specifications

## Example Usage

Using the MCP client (pseudocode):

```javascript
// Get instance types
const instanceTypes = await mcpClient.getResource("ec2://instance-types");

// Get pricing for t3.micro in multiple regions using a tool
const prices = await mcpClient.useTool("getInstancePrices", {
  instanceType: "t3.micro",
  regions: ["us-east-1", "us-west-2", "eu-west-1"],
  priceType: "onDemand"
});

// Get specifications for c5.xlarge using a tool
const specs = await mcpClient.useTool("getInstanceSpecs", {
  instanceType: "c5.xlarge",
  region: "us-east-1"
});

// Start a conversation with the price comparison prompt
const priceComparisonConversation = await mcpClient.usePrompt("compare-prices");

// Start a conversation with the instance specifications prompt
const specsConversation = await mcpClient.usePrompt("instance-specs");
```

## Adding New Functionality

To add new resources or tools to the MCP server:

1. Edit `src/services/mcp.service.ts`
2. Register new resources using `server.resource()`
3. Register new tools using `server.tool()`
4. Rebuild and restart the MCP server