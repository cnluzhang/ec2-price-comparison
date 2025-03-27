import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config();

/**
 * Environment configuration with default values
 */
export const config = {
  // Server configuration
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // AWS configuration
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    // China region configuration
    cn: {
      region: 'cn-northwest-1',
      endpoint: 'https://api.pricing.cn-northwest-1.amazonaws.com.cn',
      ec2Endpoint: 'https://ec2.cn-northwest-1.amazonaws.com.cn',
      accessKeyId: process.env.AWS_CN_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_CN_SECRET_ACCESS_KEY || ''
    }
  },
  
  // Currency configuration
  currency: {
    cnyToUsdRate: parseFloat(process.env.CNY_TO_USD_RATE || '7.3')
  }
};

/**
 * Gets the CNY to USD exchange rate
 */
export const getExchangeRate = (): number => {
  return config.currency.cnyToUsdRate;
};
