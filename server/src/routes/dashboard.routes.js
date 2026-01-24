import { Router } from 'express';
import { getSummary } from '../controllers/dashboard.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.use('/dashboard', authenticateToken);

router.get('/dashboard/summary', getSummary);

export default router;
