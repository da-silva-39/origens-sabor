import { Router } from 'express';
import {
  criarReserva,
  minhasReservas,
  cancelarReserva,
  listarTodasReservas,
  confirmarReserva,
  adminCancelarReserva,
  obterReserva,
  validarReservaQR,        // só uma vez
  verificarDisponibilidade, // adicionar esta importação
} from '../controllers/reservaController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';

const router = Router();

// ==================== ROTAS PÚBLICAS (sem autenticação) ====================
router.get('/validar/:id', validarReservaQR);
router.get('/disponibilidade', verificarDisponibilidade);

// ==================== ROTAS PROTEGIDAS (exigem autenticação) ====================
router.use(authMiddleware);

// Cliente
router.post('/', criarReserva);
router.get('/minhas', minhasReservas);
router.delete('/:id', cancelarReserva);
router.get('/:id', obterReserva);

// Admin (exigem role ADMIN)
router.get('/admin/todas', adminMiddleware, listarTodasReservas);
router.patch('/admin/:id/confirmar', adminMiddleware, confirmarReserva);
router.patch('/admin/:id/cancelar', adminMiddleware, adminCancelarReserva);

export default router;