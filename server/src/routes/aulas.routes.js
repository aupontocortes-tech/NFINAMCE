import { Router } from 'express';
import * as Aulas from '../controllers/aulas.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.use('/aulas', authenticateToken);

router.get('/aulas', Aulas.list);
router.post('/aulas', Aulas.create);
router.put('/aulas/:id', Aulas.update);
router.delete('/aulas/:id', Aulas.remove);

export default router;
