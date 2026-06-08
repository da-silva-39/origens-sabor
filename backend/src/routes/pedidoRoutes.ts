import { Router } from 'express';
import { listarPedidosCliente } from '../controllers/pedidoController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
router.get('/cliente', authMiddleware, listarPedidosCliente);

export default router;