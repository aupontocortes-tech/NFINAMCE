import { Router } from 'express';
import * as Schedules from '../controllers/schedules.controller.js';

const router = Router();

router.get('/horarios', Schedules.list);
router.post('/horarios', Schedules.create);
router.delete('/horarios/:id', Schedules.remove);

export default router;