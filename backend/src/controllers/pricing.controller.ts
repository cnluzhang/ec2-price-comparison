import { Request, Response } from 'express';
import { PricingService } from '../services/pricing.service';
import { GetPricesRequest, PriceType } from '../types/pricing';
import { getExchangeRate } from '../config/environment';

const pricingService = new PricingService();

/**
 * Pricing API controller
 */
export class PricingController {
  /**
   * Get exchange rate
   */
  async getExchangeRate(req: Request, res: Response) {
    try {
      const rate = getExchangeRate();
      return res.json({ 
        success: true,
        data: { rate } 
      });
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch exchange rate'
        }
      });
    }
  }

  /**
   * Get all instance types
   */
  async getInstanceTypes(req: Request, res: Response) {
    try {
      const instanceTypes = await pricingService.getInstanceTypes();
      return res.json({
        success: true,
        data: instanceTypes
      });
    } catch (error) {
      console.error('Error fetching instance types:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch instance types'
        }
      });
    }
  }

  /**
   * Get all available regions
   * Note: We now return an empty array since regions are managed in frontend
   */
  async getRegions(req: Request, res: Response) {
    console.log('Region request received - returning empty array (regions managed in frontend)');
    return res.json({
      success: true,
      data: [] // Empty array - frontend manages regions in regions.ts
    });
  }

  /**
   * Get EC2 prices
   */
  async getPrices(req: Request, res: Response) {
    try {
      const { instanceType, regions } = req.body;
      
      if (!instanceType) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_PARAMETER',
            message: 'Instance type is required'
          }
        });
      }

      const prices = await pricingService.getEC2Prices(instanceType, regions);
      return res.json({
        success: true,
        data: prices
      });
    } catch (error) {
      console.error('Error fetching prices:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch prices'
        }
      });
    }
  }

  /**
   * Get EC2 prices by instance type and optional regions and price type
   */
  async getPricesByInstanceType(req: Request, res: Response) {
    try {
      const { instanceType } = req.params;
      const { regions, priceType } = req.query;
      
      let targetRegions: string[] | undefined;
      if (regions) {
        targetRegions = Array.isArray(regions) 
          ? regions.map(r => String(r))
          : [String(regions)];
      }
      
      const prices = await pricingService.getEC2Prices(
        instanceType, 
        targetRegions,
        priceType ? String(priceType) as PriceType : 'OnDemand'
      );
      
      return res.json({
        success: true,
        data: prices
      });
    } catch (error) {
      console.error('Error fetching EC2 prices by instance type:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch EC2 prices'
        }
      });
    }
  }
}
