import { Router } from 'express';
import { listarPedidosAgente, marcarEntregue } from '../controllers/pedidoController';
import { authMiddleware } from '../middlewares/authMiddleware';
const router = Router();
router.use(authMiddleware);
router.get('/agente', listarPedidosAgente);
router.put('/:id/entregue', marcarEntregue);
export default router;