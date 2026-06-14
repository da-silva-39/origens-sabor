import { Router } from 'express';
import {
  listarMesas,
  criarMesa,
  atualizarMesa,
  deletarMesa,
} from '../controllers/mesaController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';

const router = Router();

router.use(authMiddleware, adminMiddleware);
router.get('/', listarMesas);
router.post('/', criarMesa);
router.put('/:id', atualizarMesa);
router.delete('/:id', deletarMesa);

export default router;