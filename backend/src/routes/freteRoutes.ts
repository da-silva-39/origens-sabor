import { Router } from 'express';
import { listarBairros } from '../controllers/freteController';

const router = Router();
router.get('/bairros', listarBairros);

export default router;