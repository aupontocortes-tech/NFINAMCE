import { Router } from 'express';
import * as Auth from '../controllers/auth.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', Auth.register);
router.post('/login', Auth.login);
router.get('/me', authenticateToken, Auth.me);

export default router;
