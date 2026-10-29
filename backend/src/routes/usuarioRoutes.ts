import { Router } from 'express';
import { 
  listarUsuarios, 
  criarUsuario, 
  toggleUsuarioAtivo, 
  atualizarPerfil, 
  alterarSenha, 
  uploadFoto,
  guardarLocalizacaoAgente,
  obterUltimaLocalizacaoAgente
} from '../controllers/usuarioController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { uploadProfile } from '../config/cloudinary';

const router = Router();

router.use(authMiddleware);

router.get('/', adminMiddleware, listarUsuarios);
router.post('/', adminMiddleware, criarUsuario);
router.patch('/:id/toggle', adminMiddleware, toggleUsuarioAtivo);
router.put('/perfil', atualizarPerfil);
router.put('/alterar-senha', alterarSenha);
router.post('/upload-foto', uploadProfile.single('foto'), uploadFoto);

router.post(
  '/agente/localizacao',
  roleMiddleware(['AGENTE']),
  guardarLocalizacaoAgente
);

router.get(
  '/admin/agente/:id/localizacao',
  adminMiddleware,
  obterUltimaLocalizacaoAgente
);

export default router;