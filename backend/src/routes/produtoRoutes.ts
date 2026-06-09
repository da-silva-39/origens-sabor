import { Router } from 'express';
import { listarProdutos, criarProduto, atualizarProduto, deletarProduto } from '../controllers/produtoController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';
import uploadProduto from '../middlewares/uploadProduto';

const router = Router();

router.get('/', listarProdutos); // público
router.post('/', authMiddleware, adminMiddleware, uploadProduto.single('imagem'), criarProduto);
router.put('/:id', authMiddleware, adminMiddleware, uploadProduto.single('imagem'), atualizarProduto);
router.delete('/:id', authMiddleware, adminMiddleware, deletarProduto);

export default router;