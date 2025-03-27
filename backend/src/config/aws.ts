import { PricingClient } from '@aws-sdk/client-pricing';
import { EC2Client } from '@aws-sdk/client-ec2';
import { config } from './environment';

/**
 * AWS client configurations
 */

// Global region clients
export const pricingClient = new PricingClient({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey
  }
});

export const ec2Client = new EC2Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey
  }
});

// China region clients
export const cnPricingClient = new PricingClient({
  region: config.aws.cn.region,
  endpoint: config.aws.cn.endpoint,
  credentials: {
    accessKeyId: config.aws.cn.accessKeyId,
    secretAccessKey: config.aws.cn.secretAccessKey
  }
});

export const cnEc2Client = new EC2Client({
  region: config.aws.cn.region,
  endpoint: config.aws.cn.ec2Endpoint,
  credentials: {
    accessKeyId: config.aws.cn.accessKeyId,
    secretAccessKey: config.aws.cn.secretAccessKey
  }
});
