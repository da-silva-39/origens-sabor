import { Router } from 'express';
import { listarMesas } from '../controllers/usuarioController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Todas as rotas exigem autenticação
router.use(authMiddleware);

router.get('/', listarMesas);

export default router;