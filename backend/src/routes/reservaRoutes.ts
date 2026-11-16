import { Router } from 'express';
import {
  criarReserva,
  minhasReservas,
  cancelarReserva,
  listarTodasReservas,
  confirmarReserva,
  adminCancelarReserva,
  obterReserva,
  validarReservaQR,
  verificarDisponibilidade,
} from '../controllers/reservaController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { optionalAuth } from '../middlewares/optionalAuth';
import { adminMiddleware } from '../middlewares/adminMiddleware';

const router = Router();

// Público
router.get('/validar/:id', validarReservaQR);
router.get('/disponibilidade', verificarDisponibilidade);
router.post('/', optionalAuth, criarReserva);

// Autenticado
router.use(authMiddleware);

router.get('/minhas', minhasReservas);

// Admin (antes de /:id para não colidir com o parâmetro)
router.get('/admin/todas', adminMiddleware, listarTodasReservas);
router.patch('/admin/:id/confirmar', adminMiddleware, confirmarReserva);
router.patch('/admin/:id/cancelar', adminMiddleware, adminCancelarReserva);

router.delete('/:id', cancelarReserva);
router.get('/:id', obterReserva);

export default router;
