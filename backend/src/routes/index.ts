import { Router } from 'express';
import authRoutes from './authRoutes';
import appointmentRoutes from './appointmentRoutes';
import { RevenueController } from '../controllers/revenueController';
import { authenticate } from '../middleware/auth';

const router = Router();
const revenueController = new RevenueController();

router.use('/auth', authRoutes);

router.use('/appointments', appointmentRoutes);
router.get('/revenue', authenticate, revenueController.getRevenue);

router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

export default router;