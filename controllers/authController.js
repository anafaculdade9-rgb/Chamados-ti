
const { db, auth } = require('../config/firebase/admin');

async function login(req, res) {
    try {
        const authorization = req.headers.authorization || '';

        if (!authorization.startsWith('Bearer ')) {
            return res.status(401).json({
                erro: 'Token de autenticação não informado.'
            });
        }

        const token = authorization.substring(7);
        const usuarioAutenticado = await auth.verifyIdToken(token);

        const uid = usuarioAutenticado.uid;
        const email = usuarioAutenticado.email;

        if (!email) {
            return res.status(400).json({
                erro: 'E-mail não encontrado.'
            });
        }

        const nome = (
            req.body.nome ||
            usuarioAutenticado.name ||
            email.split('@')[0]
        ).trim();

        const usuarioRef = db.collection('usuarios').doc(uid);
        const usuario = await usuarioRef.get();

        if (!usuario.exists) {
            await usuarioRef.set({
                uid,
                nome,
                email,
                perfil: 'user'
            });
        }

        // Cria a sessão do usuário
        const sessionCookie = await auth.createSessionCookie(token, {
            expiresIn: 5 * 24 * 60 * 60 * 1000
        });

        res.cookie('session', sessionCookie, {
            maxAge: 5 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        });

        const usuarioAtualizado = await usuarioRef.get();

        return res.status(200).json({
            sucesso: true,
            usuario: usuarioAtualizado.data()
        });

    } catch (error) {
        console.error('Erro na autenticação:', error);

        return res.status(401).json({
            erro: 'Não foi possível validar sua autenticação.'
        });
    }
}

function logout(req, res) {
    res.clearCookie('session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
    });

    res.redirect('/login');
}

module.exports = {
    login,
    logout
};

