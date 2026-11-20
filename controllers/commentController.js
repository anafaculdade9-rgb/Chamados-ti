const { Ticket, Comment } = require('../models');
const { validationMessages } = require('../utils/helpers');

// POST /tickets/:id/comments
exports.create = async (req, res) => {
  try {
    const usuario = req.usuario;

    // Aceitar somente os perfis previstos no RBAC.
    if (!['user', 'tecnico', 'admin'].includes(usuario.perfil)) {
      return res.status(403).render('error', {
        title: 'Acesso negado',
        error: new Error('Perfil sem permissão para comentar.')
      });
    }

    const ticket = await Ticket.findByPk(req.params.id);

    if (!ticket) {
      return res.status(404).render('404', {
        title: 'Chamado não encontrado'
      });
    }

    // Usuário comum só comenta nos próprios chamados.
    if (usuario.perfil === 'user' && ticket.uid !== usuario.uid) {
      return res.status(403).render('error', {
        title: 'Acesso negado',
        error: new Error('Você não tem permissão para comentar neste chamado.')
      });
    }

    const mensagem = typeof req.body.mensagem === 'string'
      ? req.body.mensagem.trim()
      : '';

    if (!mensagem) {
      return res.redirect(
        `/tickets/${ticket.id}?erro=${encodeURIComponent('Escreva uma mensagem.')}#comentarios`
      );
    }

    const tipoSolicitado = req.body.tipo || 'comentario';

    // Aceitar somente os dois tipos enviados pelo formulário.
    if (!['comentario', 'parecer'].includes(tipoSolicitado)) {
      return res.status(400).render('error', {
        title: 'Registro inválido',
        error: new Error('Tipo de registro inválido.')
      });
    }

    // Somente técnico e administrador registram parecer.
    if (
      tipoSolicitado === 'parecer' &&
      !['tecnico', 'admin'].includes(usuario.perfil)
    ) {
      return res.status(403).render('error', {
        title: 'Acesso negado',
        error: new Error('Somente a equipe técnica pode registrar pareceres.')
      });
    }

    const autor = usuario.nome || usuario.email;

    await Comment.create({
      ticketId: ticket.id,
      autor,
      mensagem,
      tipo: tipoSolicitado
    });

    const mensagemSucesso = tipoSolicitado === 'parecer'
      ? 'Parecer técnico adicionado.'
      : 'Comentário adicionado.';

    return res.redirect(
      `/tickets/${ticket.id}?msg=${encodeURIComponent(mensagemSucesso)}#comentarios`
    );

  } catch (err) {
    const errors = validationMessages(err);

    if (!errors) throw err;

    return res.redirect(
      `/tickets/${req.params.id}?erro=${encodeURIComponent(errors.join(' '))}#comentarios`
    );
  }
};
