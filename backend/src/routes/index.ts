import { Router } from 'express';
import { pricingRoutes } from './pricing.routes';

const router = Router();

// Register all routes
router.use('/pricing', pricingRoutes);

export const apiRoutes = router;
