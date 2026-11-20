const express = require('express');
const router = express.Router();
const users = require('../controllers/userController');
const dashboard = require('../controllers/dashboardController');
const tickets = require('../controllers/ticketController');
const comments = require('../controllers/commentController');
const technicians = require('../controllers/technicianController');
const categories = require('../controllers/categoryController');
const authController = require('../controllers/authController');

const {
  exigirLogin,
  permitirPerfis
} = require('../middlewares/auth');

// ==========================================
// ROTAS PUBLICAS
// ==========================================

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/auth/login', authController.login);

// Verifica se existe uma sessão válida no servidor.
router.get('/auth/session', (req, res) => {
  if (!req.usuario) {
    return res.status(401).json({
      authenticated: false
    });
  }

  return res.json({
    authenticated: true,
    usuario: {
      nome: req.usuario.nome,
      email: req.usuario.email,
      perfil: req.usuario.perfil
    }
  });
});

// ==========================================
// ROTAS QUE EXIGEM AUTENTICACAO
// ==========================================

router.use(exigirLogin);

// USUARIOS - SOMENTE ADMIN
router.get('/users', permitirPerfis('admin'), users.index);
router.put('/users/:uid', permitirPerfis('admin'), users.update);


router.post('/logout', authController.logout);

// Dashboard
router.get('/', dashboard.index);

// ==========================================
// CHAMADOS
// ==========================================

// Todos os perfis podem consultar a lista.
// O controller deve filtrar os chamados do usuario.
router.get('/tickets', tickets.index);

// Todos os perfis podem abrir chamados.
router.get('/tickets/new', tickets.new);
router.post('/tickets', tickets.create);

// Todos podem consultar chamados permitidos.
// O controller deve verificar a propriedade do chamado.
router.get('/tickets/:id', tickets.show);

// Somente admin pode editar chamados.
router.get(
  '/tickets/:id/edit',
  permitirPerfis('admin'),
  tickets.edit
);

router.put(
  '/tickets/:id',
  permitirPerfis('admin'),
  tickets.update
);

// Tecnico e admin podem atualizar o andamento.
router.patch(
  '/tickets/:id/quick',
  permitirPerfis('tecnico', 'admin'),
  tickets.quickUpdate
);

// Somente admin pode excluir chamados.
router.delete(
  '/tickets/:id',
  permitirPerfis('admin'),
  tickets.destroy
);

// Comentarios: o controller deve verificar acesso ao chamado.
router.post('/tickets/:id/comments', comments.create);

// ==========================================
// TECNICOS - SOMENTE ADMIN
// ==========================================

router.get(
  '/technicians',
  permitirPerfis('admin'),
  technicians.index
);

router.get(
  '/technicians/new',
  permitirPerfis('admin'),
  technicians.new
);

router.post(
  '/technicians',
  permitirPerfis('admin'),
  technicians.create
);

router.get(
  '/technicians/:id/edit',
  permitirPerfis('admin'),
  technicians.edit
);

router.put(
  '/technicians/:id',
  permitirPerfis('admin'),
  technicians.update
);

router.delete(
  '/technicians/:id',
  permitirPerfis('admin'),
  technicians.destroy
);

// ==========================================
// CATEGORIAS - SOMENTE ADMIN
// ==========================================

router.get(
  '/categories',
  permitirPerfis('admin'),
  categories.index
);

router.get(
  '/categories/new',
  permitirPerfis('admin'),
  categories.new
);

router.post(
  '/categories',
  permitirPerfis('admin'),
  categories.create
);

router.get(
  '/categories/:id/edit',
  permitirPerfis('admin'),
  categories.edit
);

router.put(
  '/categories/:id',
  permitirPerfis('admin'),
  categories.update
);

router.delete(
  '/categories/:id',
  permitirPerfis('admin'),
  categories.destroy
);

module.exports = router;
