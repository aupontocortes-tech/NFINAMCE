import { Router } from 'express';
import * as Employees from '../controllers/employees.controller.js';

const router = Router();

router.get('/funcionarios', Employees.list);
router.post('/funcionarios', Employees.create);
router.put('/funcionarios/:id', Employees.update);
router.delete('/funcionarios/:id', Employees.remove);

export default router;