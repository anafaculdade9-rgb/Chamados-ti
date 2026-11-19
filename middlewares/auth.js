
const { auth, db } = require('../config/firebase/admin');

async function carregarUsuario(req, res, next) {
  try {
    const cookies = (req.headers.cookie || '').split(';');

    const cookieSession = cookies.find((item) =>
      item.trim().startsWith('session=')
    );

    if (!cookieSession) {
      req.usuario = null;
      res.locals.usuario = null;
      return next();
    }

    const sessionCookie = decodeURIComponent(
      cookieSession.trim().substring(8)
    );

    const decoded = await auth.verifySessionCookie(sessionCookie, true);

    const usuarioRef = db.collection('usuarios').doc(decoded.uid);
    const usuarioDoc = await usuarioRef.get();

    if (!usuarioDoc.exists) {
      req.usuario = null;
      res.locals.usuario = null;
      return next();
    }

    req.usuario = usuarioDoc.data();
    res.locals.usuario = req.usuario;

    return next();

  } catch (error) {
    req.usuario = null;
    res.locals.usuario = null;
    res.clearCookie('session');
    return next();
  }
}

function exigirLogin(req, res, next) {
  if (!req.usuario) {
    return res.redirect('/login');
  }

  return next();
}

function permitirPerfis(...perfis) {
  return (req, res, next) => {
    if (!req.usuario || !perfis.includes(req.usuario.perfil)) {
      return res.status(403).render('error', {
        title: 'Acesso negado',
        error: new Error('Você não tem permissão para acessar esta página.')
      });
    }

    return next();
  };
}

module.exports = {
  carregarUsuario,
  exigirLogin,
  permitirPerfis
};

