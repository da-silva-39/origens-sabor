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
import upload from '../middlewares/upload';

const router = Router();

router.use(authMiddleware); // todas as rotas exigem autenticação

// Rotas existentes
router.get('/', adminMiddleware, listarUsuarios);
router.post('/', adminMiddleware, criarUsuario);
router.patch('/:id/toggle', adminMiddleware, toggleUsuarioAtivo);
router.put('/perfil', atualizarPerfil);
router.put('/alterar-senha', alterarSenha);
router.post('/upload-foto', upload.single('foto'), uploadFoto);

// NOVAS ROTAS
// Agente envia localização periódica
router.post(
  '/agente/localizacao',
  roleMiddleware(['AGENTE']),
  guardarLocalizacaoAgente
);

// Admin consulta última localização de um agente
router.get(
  '/admin/agente/:id/localizacao',
  adminMiddleware,
  obterUltimaLocalizacaoAgente
);

export default router;