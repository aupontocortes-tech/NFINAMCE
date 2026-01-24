import { Router } from 'express';
import * as Payments from '../controllers/payments.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.use('/pagamentos', authenticateToken);

router.get('/pagamentos', Payments.list);
router.post('/pagamentos/:id/pago', Payments.markAsPaid);

export default router;
