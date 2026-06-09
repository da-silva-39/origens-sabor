import { Router } from 'express';
import {
  listarPedidosCliente,
  listarPedidosAgente,
  marcarEntregue,
  listarTodosPedidos,
  atualizarStatusPedido,
  atribuirAgente,
} from '../controllers/pedidoController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';

const router = Router();

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// Cliente
router.get('/cliente', listarPedidosCliente);

// Agente
router.get('/agente', listarPedidosAgente);
router.put('/:id/entregue', marcarEntregue);

// Admin
router.get('/todos', adminMiddleware, listarTodosPedidos);
router.put('/:id/status', adminMiddleware, atualizarStatusPedido);
router.put('/:id/agente', adminMiddleware, atribuirAgente);

export default router;