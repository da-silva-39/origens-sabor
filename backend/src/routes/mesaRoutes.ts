import { Router } from 'express';
import { listarMesas } from '../controllers/mesaController';

const router = Router();

router.get('/', listarMesas);

export default router;
