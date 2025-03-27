import { Router } from 'express';
import { PricingController } from '../controllers/pricing.controller';

const router = Router();
const pricingController = new PricingController();

// Get regions (now managed on the frontend)
router.get('/regions', pricingController.getRegions);

// Get instance types
router.get('/instance-types', pricingController.getInstanceTypes);

// Get EC2 prices by instance type with optional query params
router.get('/ec2/:instanceType', pricingController.getPricesByInstanceType);

// Get prices (POST)
router.post('/prices', pricingController.getPrices);

// Get exchange rate
router.get('/exchange-rate', pricingController.getExchangeRate);

export const pricingRoutes = router;
