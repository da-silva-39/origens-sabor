import { Router } from 'express';
import { listarProdutos, criarProduto, atualizarProduto, deletarProduto } from '../controllers/produtoController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';
import { uploadProduct } from '../config/cloudinary';

const router = Router();

router.get('/', listarProdutos);
router.post('/', authMiddleware, adminMiddleware, uploadProduct.single('imagem'), criarProduto);
router.put('/:id', authMiddleware, adminMiddleware, uploadProduct.single('imagem'), atualizarProduto);
router.delete('/:id', authMiddleware, adminMiddleware, deletarProduto);

export default router;