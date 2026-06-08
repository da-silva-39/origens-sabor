import { Router } from 'express';
import { listarProdutos } from '../controllers/produtoController';

const router = Router();
router.get('/', listarProdutos);

export default router;