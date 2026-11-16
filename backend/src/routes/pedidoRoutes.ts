import { Router } from 'express';
import {
  listarPedidosCliente,
  criarPedido,
  listarPedidosAgente,
  marcarEntregue,
  listarTodosPedidos,
  atualizarStatusPedido,
  listarAgentes,
  atribuirAgente,
} from '../controllers/pedidoController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

const router = Router();

router.use(authMiddleware);

// Cliente
router.get('/cliente', listarPedidosCliente);
router.post('/', criarPedido);

// Agente
router.get('/agente', roleMiddleware(['AGENTE', 'ADMIN']), listarPedidosAgente);
router.put('/:id/entregue', roleMiddleware(['AGENTE', 'ADMIN']), marcarEntregue);

// Admin
router.get('/todos', adminMiddleware, listarTodosPedidos);
router.get('/agentes', adminMiddleware, listarAgentes);        // lista de agentes para o select
router.put('/:id/status', adminMiddleware, atualizarStatusPedido);
router.put('/:id/agente', adminMiddleware, atribuirAgente);

export default router;