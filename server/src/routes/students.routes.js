import { Router } from 'express';
import * as Students from '../controllers/students.controller.js';

const router = Router();

router.get('/alunos', Students.list);
router.post('/alunos', Students.create);
router.put('/alunos/:id', Students.update);
router.delete('/alunos/:id', Students.remove);

export default router;