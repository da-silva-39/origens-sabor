import { Router } from 'express';
import {
  criarReserva,
  minhasReservas,
  cancelarReserva,
  listarTodasReservas,
  confirmarReserva,
  adminCancelarReserva,
  obterReserva,
} from '../controllers/reservaController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';

const router = Router();

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// Cliente
router.post('/', criarReserva);
router.get('/minhas', minhasReservas);
router.delete('/:id', cancelarReserva);
router.get('/:id', obterReserva);

// Admin
router.get('/admin/todas', adminMiddleware, listarTodasReservas);
router.patch('/admin/:id/confirmar', adminMiddleware, confirmarReserva);
router.patch('/admin/:id/cancelar', adminMiddleware, adminCancelarReserva);

export default router;