import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Response type for standard API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// Instance specification
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

// EC2 price information
export interface EC2Price {
  region: string;
  instanceType: string;
  operatingSystem: string;
  price: number | null;
  currency: string;
  onDemandPrice?: number | null;
  onDemandCurrency?: string;
  savingsPercentage?: number | null;
  specifications?: InstanceSpecification;
}

// Region information
export interface Region {
  code: string;        // e.g., us-east-1
  name: string;        // e.g., US East (N. Virginia)
  endpoint: string;    // API endpoint
  optInStatus: string; // Region opt-in status
}

// EC2 instance type
export interface InstanceType {
  instanceType: string; // e.g., t3.xlarge
  family: string;       // e.g., t3
  description: string;  // Human-readable description
}

// Price type definition
export type PriceType = 'OnDemand' | 'Reserved1Year' | 'Reserved3Year';

// API client with automatic response unwrapping
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Response interceptor to unwrap the data
apiClient.interceptors.response.use(
  (response) => {
    // For successful responses, return the data field
    if (response.data?.success === true) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    // For errors, log and rethrow
    console.error('API Error:', error);
    if (axios.isAxiosError(error)) {
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
    return Promise.reject(error);
  }
);

export const api = {
  /**
   * Get available AWS regions
   */
  async getAvailableRegions(): Promise<Region[]> {
    console.log('Fetching available regions...');
    return apiClient.get('/pricing/regions');
  },

  /**
   * Get available EC2 instance types
   */
  async getInstanceTypes(): Promise<InstanceType[]> {
    console.log('Fetching instance types...');
    return apiClient.get('/pricing/instance-types');
  },

  /**
   * Get EC2 prices for a specific instance type
   * @param instanceType EC2 instance type (e.g., t3.xlarge)
   * @param regions Optional array of region codes
   * @param priceType Price type (OnDemand, Reserved1Year, Reserved3Year)
   */
  async getEC2Prices(
    instanceType: string, 
    regions?: string[], 
    priceType: PriceType = 'OnDemand'
  ): Promise<EC2Price[]> {
    console.log(`Fetching prices for ${instanceType} with price type ${priceType}`);
    const params = {
      ...(regions ? { regions } : {}),
      priceType
    };
    return apiClient.get(`/pricing/ec2/${instanceType}`, { params });
  },

  /**
   * Get current CNY to USD exchange rate
   */
  async getExchangeRate(): Promise<{rate: number}> {
    console.log('Fetching exchange rate...');
    return apiClient.get('/pricing/exchange-rate');
  }
};
