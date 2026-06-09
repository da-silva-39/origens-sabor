import { Router } from 'express';
import { atualizarPerfil, alterarSenha, uploadFoto } from '../controllers/usuarioController';
import { authMiddleware } from '../middlewares/authMiddleware';
import upload from '../middlewares/upload';

const router = Router();
router.use(authMiddleware);
router.put('/perfil', atualizarPerfil);
router.put('/alterar-senha', alterarSenha);
router.post('/upload-foto', upload.single('foto'), uploadFoto);

export default router;