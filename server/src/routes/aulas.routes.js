import { Router } from 'express';
import * as Aulas from '../controllers/aulas.controller.js';

const router = Router();

router.get('/aulas', Aulas.list);
router.post('/aulas', Aulas.create);
router.delete('/aulas/:id', Aulas.remove);

export default router;