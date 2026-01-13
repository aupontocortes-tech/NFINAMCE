import { Router } from 'express';
import * as AlunosController from '../controllers/alunos.controller.js';

const router = Router();

router.get('/alunos', AlunosController.listarAlunos);
router.post('/alunos', AlunosController.criarAluno);
router.put('/alunos/:id', AlunosController.atualizarAluno);
router.delete('/alunos/:id', AlunosController.deletarAluno);
router.post('/alunos/:id/pago', AlunosController.marcarComoPago);

// Rotas de cobrança
router.post('/cobrancas/rodar', AlunosController.executarCobrancaManual);
router.post('/cobrancas/pendentes', AlunosController.cobrarAtrasados);

export default router;
