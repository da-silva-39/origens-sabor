import { Router } from 'express';
import { listarUsuarios, criarUsuario, toggleUsuarioAtivo, atualizarPerfil, alterarSenha, uploadFoto } from '../controllers/usuarioController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';
import upload from '../middlewares/upload';

const router = Router();
router.use(authMiddleware);
router.get('/', adminMiddleware, listarUsuarios);
router.post('/', adminMiddleware, criarUsuario);
router.patch('/:id/toggle', adminMiddleware, toggleUsuarioAtivo);
router.put('/perfil', atualizarPerfil);
router.put('/alterar-senha', alterarSenha);
router.post('/upload-foto', upload.single('foto'), uploadFoto);
export default router;