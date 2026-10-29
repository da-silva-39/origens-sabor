import { Router } from 'express';
import { listarMesas } from '../controllers/mesaController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', listarMesas);

export default router;