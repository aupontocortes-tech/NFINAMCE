import { Router } from 'express';
import * as Students from '../controllers/students.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.use('/alunos', authenticateToken);

router.get('/alunos', Students.list);
router.post('/alunos', Students.create);
router.put('/alunos/:id', Students.update);
router.delete('/alunos/:id', Students.remove);

export default router;