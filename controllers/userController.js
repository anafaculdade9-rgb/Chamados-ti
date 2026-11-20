const { db } = require('../config/firebase/admin');

const PERFILES_VALIDOS = ['user', 'tecnico', 'admin'];

// GET /users
exports.index = async (req, res, next) => {
  try {
    const snapshot = await db.collection('usuarios').get();

    const usuarios = snapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    }));

    usuarios.sort((a, b) =>
      (a.nome || '').localeCompare(b.nome || '', 'pt-BR')
    );

    return res.render('users/index', {
      title: 'Gerenciar usuários',
      usuarios,
    });
  } catch (error) {
    return next(error);
  }
};

// PUT /users/:uid
exports.update = async (req, res, next) => {
  try {
    const uid = req.params.uid;
    const perfil = req.body.perfil;

    if (!PERFILES_VALIDOS.includes(perfil)) {
      return res.status(400).send('Perfil inválido.');
    }

    if (uid === req.usuario.uid && perfil !== 'admin') {
      return res.status(400).send(
        'Você não pode remover seu próprio acesso de administrador.'
      );
    }

    const usuarioRef = db.collection('usuarios').doc(uid);
    const usuarioDoc = await usuarioRef.get();

    if (!usuarioDoc.exists) {
      return res.status(404).send('Usuário não encontrado.');
    }

    if (usuarioDoc.data().perfil === 'admin' && perfil !== 'admin') {
      const administradores = await db
        .collection('usuarios')
        .where('perfil', '==', 'admin')
        .get();

      if (administradores.size <= 1) {
        return res.status(400).send(
          'Não é possível remover o último administrador do sistema.'
        );
      }
    }

    await usuarioRef.update({ perfil });

    return res.redirect(
      '/users?msg=' + encodeURIComponent('Perfil atualizado com sucesso!')
    );
  } catch (error) {
    return next(error);
  }
};
