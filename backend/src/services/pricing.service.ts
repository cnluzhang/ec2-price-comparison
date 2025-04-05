import { PricingClient, GetProductsCommand } from '@aws-sdk/client-pricing';
import { EC2Client, DescribeRegionsCommand, DescribeInstanceTypesCommand } from '@aws-sdk/client-ec2';
import {
  EC2Price,
  Region,
  InstanceType,
  InstanceSpecification,
  AwsRegion,
  TermAttributes,
  PriceDimension,
  Term,
  TermContainer,
  PriceDetails,
  PriceType
} from '../types/pricing';
import { pricingClient, ec2Client, cnPricingClient, cnEc2Client } from '../config/aws';
import { config } from '../config/environment';

export class PricingService {
  /**
   * Get all available AWS regions - not used anymore, regions are defined in frontend
   */
  async getAvailableRegions(): Promise<Region[]> {
    console.log('Region info is now managed by the frontend - returning empty array');
    return []; // Return empty array as frontend manages regions
  }

  /**
   * Get friendly name for a region code
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
      'ca-central-1': 'Canada (Central)',
      'eu-central-1': 'Europe (Frankfurt)',
      'eu-west-1': 'Europe (Ireland)',
      'eu-west-2': 'Europe (London)',
      'eu-west-3': 'Europe (Paris)',
      'eu-north-1': 'Europe (Stockholm)',
      'eu-south-1': 'Europe (Milan)',
      'me-south-1': 'Middle East (Bahrain)',
      'sa-east-1': 'South America (São Paulo)',
      'cn-north-1': 'China (Beijing)',
      'cn-northwest-1': 'China (Ningxia)'
    };

    return regionNames[regionCode] || regionCode;
  }

  /**
   * Get available instance types
   */
  async getInstanceTypes(): Promise<InstanceType[]> {
    console.log('Fetching instance types...');
    try {
      const instanceTypes = new Map<string, InstanceType>();
      let nextToken: string | undefined;

      do {
        const command = new DescribeInstanceTypesCommand({
          Filters: [
            {
              Name: 'instance-type',
              Values: ['*.xlarge']
            }
          ],
          MaxResults: 100,
          NextToken: nextToken
        });

        const response = await cnEc2Client.send(command);
        nextToken = response.NextToken;

        if (response.InstanceTypes) {
          for (const item of response.InstanceTypes) {
            if (!item.InstanceType) continue;
            const instanceType = item.InstanceType;
            const family = instanceType.split('.')[0];
            
            // Get instance details for better description
            let description = `${family} series - ${instanceType}`;
            
            // Add memory and vCPU info if available
            if (item.VCpuInfo?.DefaultVCpus) {
              description += ` (${item.VCpuInfo.DefaultVCpus} vCPUs`;
              
              if (item.MemoryInfo?.SizeInMiB) {
                const memoryGB = Math.round(item.MemoryInfo.SizeInMiB / 1024);
                description += `, ${memoryGB} GB RAM`;
              }
              
              description += ')';
            }
            
            instanceTypes.set(instanceType, {
              instanceType,
              family,
              description
            });
          }
        }
      } while (nextToken);

      const result = Array.from(instanceTypes.values());
      console.log(`Retrieved ${result.length} instance types`);
      
      // Sort by family first, then by instance type
      return result.sort((a, b) => {
        if (a.family !== b.family) {
          return a.family.localeCompare(b.family);
        }
        return a.instanceType.localeCompare(b.instanceType);
      });
    } catch (error) {
      console.error('Failed to get instance types:', error);
      throw error;
    }
  }

  /**
   * Extract instance specifications from pricing API response
   */
  extractInstanceSpecifications(priceDetails: PriceDetails): InstanceSpecification | null {
    try {
      if (!priceDetails.product || !priceDetails.product.attributes) {
        return null;
      }
      
      const attributes = priceDetails.product.attributes;
      
      return {
        vcpu: attributes.vcpu ? parseInt(attributes.vcpu, 10) : undefined,
        memory: attributes.memory || undefined,
        storage: attributes.storage || undefined,
        networkPerformance: attributes.networkPerformance || undefined,
        instanceFamily: attributes.instanceFamily || undefined,
        currentGeneration: attributes.currentGeneration || undefined,
        physicalProcessor: attributes.physicalProcessor || undefined,
        clockSpeed: attributes.clockSpeed || undefined,
        dedicatedEbsThroughput: attributes.dedicatedEbsThroughput || undefined,
        processorArchitecture: attributes.processorArchitecture || undefined,
        processorFeatures: attributes.processorFeatures || undefined,
        enhancedNetworkingSupported: attributes.enhancedNetworkingSupported || undefined
      };
    } catch (error) {
      console.error(`Error extracting instance specifications: ${error}`);
      return null;
    }
  }

  /**
   * Get EC2 prices for a specific instance type and optional regions and price type
   */
  async getEC2Prices(
    instanceType: string,
    regions?: string[],
    priceType: PriceType = 'OnDemand'
  ): Promise<EC2Price[]> {
    console.log(`Getting prices for ${instanceType} with price type ${priceType}`);
    const prices: EC2Price[] = [];
    
    // If no regions specified, return empty array - frontend should provide regions
    if (!regions || regions.length === 0) {
      console.log('No regions specified for pricing - returning empty array');
      return [];
    }

    // Always get on-demand prices for comparison (needed for reserved instances)
    let onDemandPrices: EC2Price[] = [];
    console.log('Getting on-demand prices for comparison...');
    for (const region of regions) {
      try {
        const { price, currency, priceDetails } = await this.getPriceForRegion(region, instanceType, 'OnDemand');
        onDemandPrices.push({
          region,
          instanceType,
          operatingSystem: 'Linux',
          price,
          currency: currency || 'USD'
        });
      } catch (error) {
        console.error(`Failed to get on-demand price for region ${region}:`, error);
      }
    }

    // Variable to store specifications once we've found them
    let specifications: InstanceSpecification | null = null;

    // Get prices for each region
    for (const region of regions) {
      try {
        console.log(`Getting price for region ${region}...`);
        const { price, currency, priceDetails } = await this.getPriceForRegion(region, instanceType, priceType);
        
        // Extract specifications from the first valid price details we find
        if (!specifications && priceDetails) {
          specifications = this.extractInstanceSpecifications(priceDetails);
        }
        
        // Get on-demand price for this region
        const onDemandInfo = onDemandPrices.find(p => p.region === region);
        const onDemandPrice = onDemandInfo?.price || null;
        const onDemandCurrency = onDemandInfo?.currency || 'USD';
        
        // Calculate savings percentage - leaving this to the frontend
        // Both reserved and on-demand prices might be in different currencies
        let savingsPercentage: number | null = null;

        prices.push({
          region,
          instanceType,
          operatingSystem: 'Linux',
          price,
          currency: currency || 'USD', // Use 'USD' as fallback
          specifications: specifications || undefined,
          // Always include on-demand price for comparison regardless of price type
          onDemandPrice,
          onDemandCurrency,
          savingsPercentage
        });
      } catch (error) {
        console.error(`Error getting price for region ${region}:`, error);
        // Add entry with null price to indicate error
        // Get on-demand price for this region (even in error cases)
        const onDemandInfo = onDemandPrices.find(p => p.region === region);
        const onDemandPrice = onDemandInfo?.price || null;
        const onDemandCurrency = onDemandInfo?.currency || 'USD';
        
        prices.push({
          region,
          instanceType,
          operatingSystem: 'Linux',
          price: null,
          currency: 'USD',
          specifications: specifications || undefined,
          // Always include on-demand price for comparison
          onDemandPrice,
          onDemandCurrency,
          savingsPercentage: null
        });
      }
    }

    console.log(`Price retrieval complete for ${prices.length} regions`);
    return prices;
  }

  /**
   * Get price for a specific region, instance type and price type
   */
  private async getPriceForRegion(
    region: string,
    instanceType: string,
    priceType: PriceType = 'OnDemand'
  ): Promise<{ price: number | null, currency: string | null, priceDetails: PriceDetails | null }> {
    try {
      console.log(`Getting price for region ${region}, instance type ${instanceType}, price type ${priceType}`);
      
      const isRegionInChina = region.startsWith('cn-');
      const client = isRegionInChina ? cnPricingClient : pricingClient;
      
      // Log the request details
      console.log(`Price search filters for ${priceType}:`, {
        region,
        instanceType,
        priceType,
        termType: priceType === 'OnDemand' ? 'OnDemand' : 'Reserved',
        ...(priceType !== 'OnDemand' ? {
          leaseContractLength: priceType === 'Reserved1Year' ? '1yr' : '3yr',
          offeringClass: 'convertible',
          purchaseOption: 'No Upfront'
        } : {})
      });
      
      // Build filters based on price type
      const isReserved = priceType !== 'OnDemand';
      
      const filters = [
        { Type: 'TERM_MATCH' as const, Field: 'instanceType', Value: instanceType },
        { Type: 'TERM_MATCH' as const, Field: 'regionCode', Value: region },
        { Type: 'TERM_MATCH' as const, Field: 'operatingSystem', Value: 'Linux' },
        { Type: 'TERM_MATCH' as const, Field: 'tenancy', Value: 'Shared' },
        { Type: 'TERM_MATCH' as const, Field: 'capacitystatus', Value: 'Used' },
        { Type: 'TERM_MATCH' as const, Field: 'preInstalledSw', Value: 'NA' },
        { Type: 'TERM_MATCH' as const, Field: 'termType', Value: isReserved ? 'Reserved' : 'OnDemand' }
      ];
      
      // Add reserved instance specific filters
      if (isReserved) {
        filters.push(
          { Type: 'TERM_MATCH' as const, Field: 'PurchaseOption', Value: 'No Upfront' },
          { Type: 'TERM_MATCH' as const, Field: 'leaseContractLength', Value: priceType === 'Reserved1Year' ? '1yr' : '3yr' },
          { Type: 'TERM_MATCH' as const, Field: 'offeringClass', Value: 'convertible' }
        );
      }
      
      const command = new GetProductsCommand({
        ServiceCode: 'AmazonEC2',
        Filters: filters,
        MaxResults: 100
      });

      const data = await client.send(command);

      if (!data.PriceList || data.PriceList.length === 0) {
        console.log(`No price found for region ${region} with price type ${priceType}`);
        // For reserved instances, return 0 to indicate no pricing available
        // For on-demand, this is likely an error, so return null
        return { 
          price: priceType === 'OnDemand' ? null : 0,
          currency: 'USD',
          priceDetails: null 
        };
      }

      const priceDetails = JSON.parse(data.PriceList[0]) as PriceDetails;
      
      if (!priceDetails.terms) {
        console.error('No terms information in price details');
        return { price: null, currency: null, priceDetails };
      }

      const terms = priceDetails.terms;
      const termKeys = Object.keys(terms);
      if (termKeys.length === 0) {
        console.error('Terms object is empty');
        return { price: null, currency: null, priceDetails };
      }

      // Find matching term
      let matchedTerm: Term | null = null;
      for (const termKey of termKeys) {
        const term = terms[termKey];
        
        // For on-demand prices, use the first term
        if (priceType === 'OnDemand') {
          if (typeof term === 'object' && !('termAttributes' in term)) {
            const subTerms = Object.values(term as TermContainer) as Term[];
            if (subTerms.length > 0) {
              matchedTerm = subTerms[0];
              break;
            }
          } else {
            matchedTerm = term as Term;
            break;
          }
          continue;
        }
        
        // For reserved instances, check term attributes
        if (typeof term === 'object' && !('termAttributes' in term)) {
          const subTerms = Object.values(term as TermContainer) as Term[];
          for (const subTerm of subTerms) {
            if (!subTerm || !subTerm.termAttributes) continue;

            const attributes = subTerm.termAttributes;
            const expectedLeaseLength = priceType === 'Reserved1Year' ? '1yr' : '3yr';
            
            // Check for matching term attributes
            const isMatch = attributes.LeaseContractLength === expectedLeaseLength &&
                           attributes.OfferingClass === 'convertible' &&
                           attributes.PurchaseOption === 'No Upfront';

            if (isMatch) {
              matchedTerm = subTerm;
              break;
            }
          }
          if (matchedTerm) break;
          continue;
        }

        // Handle direct terms
        const directTerm = term as Term;
        if (!directTerm || !directTerm.termAttributes) continue;

        const attributes = directTerm.termAttributes;
        const expectedLeaseLength = priceType === 'Reserved1Year' ? '1yr' : '3yr';
        
        // Check for matching term attributes
        const isMatch = attributes.LeaseContractLength === expectedLeaseLength &&
                       attributes.OfferingClass === 'convertible' &&
                       attributes.PurchaseOption === 'No Upfront';

        if (isMatch) {
          matchedTerm = directTerm;
          break;
        }
      }

      if (!matchedTerm || !matchedTerm.priceDimensions) {
        console.error('No matching term found or price dimensions missing');
        return { price: null, currency: null, priceDetails };
      }

      const dimensionKeys = Object.keys(matchedTerm.priceDimensions);
      if (dimensionKeys.length === 0) {
        console.error('Price dimensions is empty');
        return { price: null, currency: null, priceDetails };
      }

      const firstDimension = matchedTerm.priceDimensions[dimensionKeys[0]];
      if (!firstDimension || !firstDimension.pricePerUnit) {
        console.error('Price per unit information missing');
        return { price: null, currency: null, priceDetails };
      }

      // Get price in original currency
      const usdPrice = firstDimension.pricePerUnit.USD ? parseFloat(firstDimension.pricePerUnit.USD) : null;
      const cnyPrice = firstDimension.pricePerUnit.CNY ? parseFloat(firstDimension.pricePerUnit.CNY) : null;
      
      let price: number | null = null;
      let currency = 'USD';
      
      if (usdPrice !== null) {
        price = usdPrice;
        currency = 'USD';
      } else if (cnyPrice !== null) {
        price = cnyPrice;
        currency = 'CNY';
      }
      
      if (price === null) {
        console.error('No USD or CNY price found');
        return { price: null, currency: null, priceDetails };
      }

      return { price, currency, priceDetails };
    } catch (error) {
      console.error(`Error getting price for region ${region}:`, error);
      return { price: null, currency: null, priceDetails: null };
    }
  }
  
  /**
   * Get the exchange rate between currencies
   */
  public async getExchangeRate(): Promise<number> {
    return config.currency.cnyToUsdRate;
  }
}