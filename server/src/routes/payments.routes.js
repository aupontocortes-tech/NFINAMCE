import { Router } from 'express';
import { list, create } from '../controllers/payments.controller.js';

const router = Router();

router.get('/pagamentos', list);
router.post('/pagamentos', create);

export default router;