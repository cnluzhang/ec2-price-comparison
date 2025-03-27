/**
 * Types related to EC2 pricing and AWS responses
 */

// Region information
export interface Region {
  code: string;        // Region code (e.g., us-east-1)
  name: string;        // Human-readable name
  endpoint: string;    // API endpoint
  optInStatus: string; // Region opt-in status
}

// AWS API Response Region format
export interface AwsRegion {
  RegionName: string;
  Endpoint: string;
  OptInStatus: string;
}

// EC2 instance type
export interface InstanceType {
  instanceType: string; // Instance type code (e.g., t3.xlarge)
  family: string;       // Instance family (e.g., t3)
  description: string;  // Human-readable description
}

// EC2 instance specification
export interface InstanceSpecification {
  vcpu?: number;
  memory?: string;
  storage?: string;
  networkPerformance?: string;
  instanceFamily?: string;
  currentGeneration?: string;
  physicalProcessor?: string;
  clockSpeed?: string;
  dedicatedEbsThroughput?: string;
  processorArchitecture?: string;
  processorFeatures?: string;
  enhancedNetworkingSupported?: string;
}

// EC2 pricing information
export interface EC2Price {
  region: string;
  instanceType: string;
  operatingSystem: string;
  price: number | null;
  currency: string;
  onDemandPrice?: number | null;     // On-demand price for comparison
  onDemandCurrency?: string;         // Currency of on-demand price
  savingsPercentage?: number | null; // Savings compared to on-demand
  specifications?: InstanceSpecification; // Instance specifications
}

// Request types
export interface GetPricesRequest {
  instanceType: string;
  regions?: string[];
  priceType?: PriceType;
}

// Price types
export type PriceType = 'OnDemand' | 'Reserved1Year' | 'Reserved3Year';

// AWS Pricing API response types
export interface TermAttributes {
  LeaseContractLength: string;
  OfferingClass: string;
  PurchaseOption: string;
}

export interface PriceDimension {
  unit: string;
  endRange: string;
  description: string;
  appliesTo: string[];
  rateCode: string;
  beginRange: string;
  pricePerUnit: {
    USD?: string;
    CNY?: string;
  };
}

export interface Term {
  termAttributes: TermAttributes;
  priceDimensions: {
    [key: string]: PriceDimension;
  };
}

export interface TermContainer {
  [key: string]: Term;
}

export interface ProductAttributes {
  enhancedNetworkingSupported?: string;
  intelTurboAvailable?: string;
  memory?: string;
  dedicatedEbsThroughput?: string;
  vcpu?: string;
  capacitystatus?: string;
  locationType?: string;
  storage?: string;
  instanceFamily?: string;
  operatingSystem?: string;
  regionCode?: string;
  physicalProcessor?: string;
  clockSpeed?: string;
  ecu?: string;
  networkPerformance?: string;
  servicename?: string;
  instanceType?: string;
  tenancy?: string;
  usagetype?: string;
  normalizationSizeFactor?: string;
  processorFeatures?: string;
  servicecode?: string;
  licenseModel?: string;
  currentGeneration?: string;
  preInstalledSw?: string;
  location?: string;
  processorArchitecture?: string;
  marketoption?: string;
  operation?: string;
  [key: string]: string | undefined;
}

export interface Product {
  productFamily: string;
  attributes: ProductAttributes;
  sku?: string;
}

export interface PriceDetails {
  product?: Product;
  terms: {
    [key: string]: Term | TermContainer;
  };
}
