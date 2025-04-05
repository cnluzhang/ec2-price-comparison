import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { PricingService } from './pricing.service';
import { InstanceSpecification } from '../types/pricing';

/**
 * Model Context Protocol (MCP) service for EC2 price comparison
 * This service exposes the pricing functionality to LLMs through MCP
 */
export class McpService {
  private server: McpServer;
  private pricingService: PricingService;

  constructor() {
    this.server = new McpServer({
      name: "ec2-price-comparison",
      version: "1.0.0"
    });
    this.pricingService = new PricingService();
    this.registerResources();
    this.registerTools();
    this.registerPrompts();
  }
  
  /**
   * Helper method to get region name from code
   */
  private getRegionName(regionCode: string): string {
    const regionNames: Record<string, string> = {
      'us-east-1': 'US East (N. Virginia)',
      'us-east-2': 'US East (Ohio)',
      'us-west-1': 'US West (N. California)',
      'us-west-2': 'US West (Oregon)',
      'af-south-1': 'Africa (Cape Town)',
      'ap-east-1': 'Asia Pacific (Hong Kong)',
      'ap-south-1': 'Asia Pacific (Mumbai)',
      'ap-northeast-1': 'Asia Pacific (Tokyo)',
      'ap-northeast-2': 'Asia Pacific (Seoul)',
      'ap-northeast-3': 'Asia Pacific (Osaka)',
      'ap-southeast-1': 'Asia Pacific (Singapore)',
      'ap-southeast-2': 'Asia Pacific (Sydney)',
      'ap-southeast-3': 'Asia Pacific (Jakarta)',
      'ap-southeast-4': 'Asia Pacific (Melbourne)',
      'ca-central-1': 'Canada (Central)',
      'eu-central-1': 'Europe (Frankfurt)',
      'eu-central-2': 'Europe (Zurich)',
      'eu-west-1': 'Europe (Ireland)',
      'eu-west-2': 'Europe (London)',
      'eu-west-3': 'Europe (Paris)',
      'eu-south-1': 'Europe (Milan)',
      'eu-south-2': 'Europe (Spain)',
      'eu-north-1': 'Europe (Stockholm)',
      'me-south-1': 'Middle East (Bahrain)',
      'me-central-1': 'Middle East (UAE)',
      'il-central-1': 'Israel (Tel Aviv)',
      'sa-east-1': 'South America (São Paulo)',
      'cn-north-1': 'China (Beijing)',
      'cn-northwest-1': 'China (Ningxia)'
    };

    return regionNames[regionCode] || regionCode;
  }

  /**
   * Register MCP resources (data providers)
   */
  private registerResources(): void {
    // Resource: Instance types list
    this.server.resource(
      "instance-types",
      "ec2://instance-types",
      async (uri: URL) => {
        try {
          const instanceTypes = await this.pricingService.getInstanceTypes();
          return {
            contents: [{
              uri: uri.toString(),
              text: JSON.stringify(instanceTypes)
            }]
          };
        } catch (error) {
          return {
            contents: [{
              uri: uri.toString(),
              text: JSON.stringify({ error: "Failed to fetch instance types" })
            }]
          };
        }
      }
    );

    // Resource: Exchange rate
    this.server.resource(
      "exchange-rate",
      "ec2://exchange-rate",
      async (uri: URL) => {
        try {
          const rate = await this.pricingService.getExchangeRate();
          return {
            contents: [{
              uri: uri.toString(),
              text: JSON.stringify({ cnyToUsd: rate })
            }]
          };
        } catch (error) {
          return {
            contents: [{
              uri: uri.toString(),
              text: JSON.stringify({ error: "Failed to fetch exchange rate" })
            }]
          };
        }
      }
    );

    // Resource: Supported regions - explicitly show that China regions are supported
    this.server.resource(
      "supported-regions",
      "ec2://supported-regions",
      async (uri: URL) => {
        try {
          return {
            contents: [{
              uri: uri.toString(),
              text: JSON.stringify({
                description: "All AWS regions supported by EC2 Price Comparison, including China regions",
                regions: {
                  "North America": [
                    { code: "us-east-1", name: "US East (N. Virginia)" },
                    { code: "us-east-2", name: "US East (Ohio)" },
                    { code: "us-west-1", name: "US West (N. California)" },
                    { code: "us-west-2", name: "US West (Oregon)" },
                    { code: "ca-central-1", name: "Canada (Central)" },
                    { code: "mx-central-1", name: "Mexico (Central)" }
                  ],
                  "South America": [
                    { code: "sa-east-1", name: "South America (São Paulo)" }
                  ],
                  "Europe": [
                    { code: "eu-central-1", name: "Europe (Frankfurt)" },
                    { code: "eu-west-1", name: "Europe (Ireland)" },
                    { code: "eu-west-2", name: "Europe (London)" },
                    { code: "eu-west-3", name: "Europe (Paris)" },
                    { code: "eu-north-1", name: "Europe (Stockholm)" },
                    { code: "eu-south-1", name: "Europe (Milan)" },
                    { code: "eu-south-2", name: "Europe (Spain)" },
                    { code: "eu-central-2", name: "Europe (Zurich)" }
                  ],
                  "Asia Pacific": [
                    { code: "ap-east-1", name: "Asia Pacific (Hong Kong)" },
                    { code: "ap-south-1", name: "Asia Pacific (Mumbai)" },
                    { code: "ap-south-2", name: "Asia Pacific (Hyderabad)" },
                    { code: "ap-northeast-1", name: "Asia Pacific (Tokyo)" },
                    { code: "ap-northeast-2", name: "Asia Pacific (Seoul)" },
                    { code: "ap-northeast-3", name: "Asia Pacific (Osaka)" },
                    { code: "ap-southeast-1", name: "Asia Pacific (Singapore)" },
                    { code: "ap-southeast-2", name: "Asia Pacific (Sydney)" },
                    { code: "ap-southeast-3", name: "Asia Pacific (Jakarta)" },
                    { code: "ap-southeast-4", name: "Asia Pacific (Melbourne)" }
                  ],
                  "Middle East": [
                    { code: "me-south-1", name: "Middle East (Bahrain)" },
                    { code: "me-central-1", name: "Middle East (UAE)" },
                    { code: "il-central-1", name: "Israel (Tel Aviv)" }
                  ],
                  "Africa": [
                    { code: "af-south-1", name: "Africa (Cape Town)" }
                  ],
                  "China": [
                    { code: "cn-north-1", name: "China (Beijing)" },
                    { code: "cn-northwest-1", name: "China (Ningxia)" }
                  ]
                },
                note: "This tool supports price comparisons across ALL AWS regions including China regions (cn-north-1 and cn-northwest-1)",
                chinaSupport: true,
                currencySupport: ["USD", "CNY"]
              })
            }]
          };
        } catch (error) {
          return {
            contents: [{
              uri: uri.toString(),
              text: JSON.stringify({ error: "Failed to fetch supported regions" })
            }]
          };
        }
      }
    );
  }

  /**
   * Register MCP tools (actions)
   */
  private registerTools(): void {
    // Tool: Get EC2 instance prices
    this.server.tool(
      "getInstancePrices",
      {
        instanceType: z.string(),
        regions: z.array(z.string()).optional(),
        priceType: z.enum(["onDemand", "reserved1y", "reserved3y"]).optional()
      },
      async ({ instanceType, regions = [], priceType }) => {
        try {
          // Convert MCP price type to API price type
          let apiPriceType: 'OnDemand' | 'Reserved1Year' | 'Reserved3Year' = 'OnDemand';
          
          if (priceType === 'reserved1y') {
            apiPriceType = 'Reserved1Year';
          } else if (priceType === 'reserved3y') {
            apiPriceType = 'Reserved3Year';
          }
          
          const prices = await this.pricingService.getEC2Prices(
            instanceType,
            regions,
            apiPriceType
          );
          
          return {
            content: [{ 
              type: "text", 
              text: JSON.stringify(prices)
            }]
          };
        } catch (error) {
          return {
            content: [{ 
              type: "text", 
              text: JSON.stringify({ error: "Failed to fetch instance prices" })
            }]
          };
        }
      }
    );

    // Tool: Get instance specifications
    this.server.tool(
      "getInstanceSpecs",
      {
        instanceType: z.string(),
        region: z.string().optional()
      },
      async ({ instanceType, region = "us-east-1" }) => {
        try {
          const prices = await this.pricingService.getEC2Prices(
            instanceType,
            [region]
          );
          
          const specs = prices.length > 0 ? prices[0].specifications : null;
          
          return {
            content: [{ 
              type: "text", 
              text: JSON.stringify(specs)
            }]
          };
        } catch (error) {
          return {
            content: [{ 
              type: "text", 
              text: JSON.stringify({ error: "Failed to fetch instance specifications" })
            }]
          };
        }
      }
    );

    // Tool: Find cheapest region with USD conversion
    this.server.tool(
      "findCheapestRegion",
      {
        instanceType: z.string(),
        priceType: z.enum(["onDemand", "reserved1y", "reserved3y"]).optional()
      },
      async ({ instanceType, priceType }) => {
        try {
          // Get exchange rate for currency conversion
          const exchangeRate = await this.pricingService.getExchangeRate();
          
          // Get all available regions from our supported-regions resource
          const regions = [
            // North America
            "us-east-1", "us-east-2", "us-west-1", "us-west-2", 
            "ca-central-1", "ca-west-1", "mx-central-1",
            
            // Europe
            "eu-west-1", "eu-west-2", "eu-west-3",
            "eu-central-1", "eu-central-2", 
            "eu-north-1", "eu-south-1", "eu-south-2",
            
            // Asia Pacific
            "ap-northeast-1", "ap-northeast-2", "ap-northeast-3",
            "ap-southeast-1", "ap-southeast-2", "ap-southeast-3", 
            "ap-southeast-4", "ap-southeast-5", "ap-southeast-7",
            "ap-south-1", "ap-south-2", "ap-east-1",
            
            // Middle East
            "me-central-1", "me-south-1", "il-central-1",
            
            // South America
            "sa-east-1",
            
            // Africa
            "af-south-1",
            
            // China regions (explicitly included)
            "cn-north-1", "cn-northwest-1"
          ];
          
          // Convert MCP price type to API price type
          let apiPriceType: 'OnDemand' | 'Reserved1Year' | 'Reserved3Year' = 'OnDemand';
          if (priceType === 'reserved1y') {
            apiPriceType = 'Reserved1Year';
          } else if (priceType === 'reserved3y') {
            apiPriceType = 'Reserved3Year';
          }
          
          // Get prices for all regions
          const prices = await this.pricingService.getEC2Prices(
            instanceType,
            regions,
            apiPriceType
          );
          
          // Convert all prices to USD and find the cheapest
          const pricesInUsd = prices.map(price => {
            // Convert CNY price to USD if needed
            let priceInUsd = price.price;
            if (price.currency === 'CNY' && priceInUsd !== null) {
              priceInUsd = priceInUsd / exchangeRate;
            }
            
            return {
              region: price.region,
              regionName: this.getRegionName(price.region),
              priceInUsd,
              originalPrice: price.price,
              originalCurrency: price.currency,
              specifications: price.specifications
            };
          });
          
          // Sort by price (lowest first)
          const sortedPrices = pricesInUsd
            .filter(p => p.priceInUsd !== null) // Filter out null prices
            .sort((a, b) => {
              if (a.priceInUsd === null) return 1;
              if (b.priceInUsd === null) return -1;
              return a.priceInUsd - b.priceInUsd;
            });
          
          // Format the result
          const result = {
            instanceType,
            priceType: apiPriceType,
            cheapestRegion: sortedPrices.length > 0 ? {
              region: sortedPrices[0].region,
              regionName: sortedPrices[0].regionName,
              priceInUsd: sortedPrices[0].priceInUsd,
              originalPrice: sortedPrices[0].originalPrice,
              originalCurrency: sortedPrices[0].originalCurrency
            } : null,
            allRegions: sortedPrices,
            exchangeRate: {
              cnyToUsd: exchangeRate
            },
            queriedRegionsCount: regions.length,
            resultRegionsCount: sortedPrices.length,
            note: "All prices converted to USD for accurate comparison, including China regions"
          };
          
          return {
            content: [{ 
              type: "text", 
              text: JSON.stringify(result)
            }]
          };
        } catch (error) {
          return {
            content: [{ 
              type: "text", 
              text: JSON.stringify({ error: "Failed to find cheapest region: " + error })
            }]
          };
        }
      }
    );
  }

  /**
   * Connect the MCP server to stdio transport
   */
  async connect(): Promise<void> {
    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      console.log("MCP Server connected via stdio");
    } catch (error) {
      console.error("Failed to connect MCP server:", error);
      throw error;
    }
  }

  /**
   * Register MCP prompts (reusable templates)
   */
  private registerPrompts(): void {
    // Price comparison prompt
    this.server.prompt(
      "compare-prices",
      "Compare EC2 instance prices across AWS regions including China regions",
      (extra) => {
        return {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: "I'd like you to compare EC2 instance prices for me across different AWS regions including China. When asked about the cheapest region for any instance type, DO NOT search the web. Instead, use the getInstancePrices tool to get pricing data for all regions and the ec2://supported-regions resource to see all supported regions including China regions. For accurate comparison, use the ec2://exchange-rate resource to convert CNY prices to USD when needed. Compare price in USD by default. Please return a formatted markdown comparison table with all prices in USD and highlight the cheapest region."
              }
            },
            {
              role: "assistant",
              content: {
                type: "text", 
                text: "I'll help you compare EC2 instance prices across global AWS regions, including China regions (Beijing and Ningxia). I'll get real-time pricing data using the API and convert all prices to USD for proper comparison.\n\nWhat instance type are you interested in? You can specify which regions you'd like to compare, or I can include all major regions including China in the comparison and find the cheapest one for you."
              }
            }
          ]
        };
      }
    );
    
    // Find cheapest region prompt
    this.server.prompt(
      "find-cheapest-region",
      "Find the cheapest AWS region for a specific EC2 instance type with automatic USD conversion",
      (extra) => {
        return {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: "I need to find the cheapest region for running a specific EC2 instance type. Please help me compare prices across all regions including China and tell me which region has the lowest price. Always convert CNY to USD for fair comparison and report all prices in USD."
              }
            },
            {
              role: "assistant",
              content: {
                type: "text", 
                text: "I'll help you find the cheapest AWS region for your EC2 instance. I'll query all regions including China using the API (not web search) and convert all prices to USD using the exchange rate.\n\nWhat instance type do you want to compare prices for? And do you want on-demand or reserved pricing?"
              }
            }
          ]
        };
      }
    );
    
    // Get instance specifications prompt
    this.server.prompt(
      "instance-specs",
      "Get detailed specifications for an EC2 instance type",
      (extra) => {
        return {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: "I need information about an EC2 instance type. You can use the getInstanceSpecs tool to retrieve this information and return a formatted markdown description."
              }
            },
            {
              role: "assistant",
              content: {
                type: "text", 
                text: "I'll retrieve EC2 instance specifications for you. What instance type would you like to learn about?"
              }
            }
          ]
        };
      }
    );
  }

  /**
   * Start the MCP server as a standalone process
   */
  static async start(): Promise<void> {
    const mcpService = new McpService();
    await mcpService.connect();
  }
}

// Start MCP server if this module is executed directly
if (require.main === module) {
  McpService.start()
    .then(() => console.log("MCP service started"))
    .catch(err => console.error("Failed to start MCP service:", err));
}