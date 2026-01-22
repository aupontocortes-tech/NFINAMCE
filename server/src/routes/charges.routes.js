import { Router } from 'express';
import * as Charges from '../controllers/charges.controller.js';

const router = Router();

router.get('/cobrancas', Charges.list);
router.post('/fechamento/:mes', Charges.generateMonthly);
router.post('/cobrancas/:id/pago', Charges.markPaid);

export default router;