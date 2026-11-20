const { Op } = require('sequelize');
const { Ticket, Technician, Category, Comment } = require('../models');
const { STATUS, PRIORIDADES } = require('../config/constants');
const { validationMessages } = require('../utils/helpers');

const include = [
  { model: Category, as: 'categoria' },
  { model: Technician, as: 'tecnico' },
];

function isAdmin(usuario) {
  return usuario.perfil === 'admin';
}

function isTecnico(usuario) {
  return usuario.perfil === 'tecnico';
}

function negarAcesso(res) {
  return res.status(403).render('error', {
    title: 'Acesso negado',
    error: new Error('Você não tem permissão para realizar esta ação.'),
  });
}

function podeVerChamado(usuario, ticket) {
  return isAdmin(usuario) ||
    isTecnico(usuario) ||
    ticket.uid === usuario.uid;
}

function pickTicket(body) {
  return {
    titulo: (body.titulo || '').trim(),
    descricao: (body.descricao || '').trim(),
    solicitante: (body.solicitante || '').trim(),
    emailSolicitante: (body.emailSolicitante || '').trim() || null,
    setor: body.setor || null,
    prioridade: body.prioridade || 'media',
    status: body.status || 'aberto',
    categoryId: body.categoryId || null,
    technicianId: body.technicianId || null,
  };
}

async function formOptions() {
  const [categorias, tecnicos] = await Promise.all([
    Category.findAll({ order: [['nome', 'ASC']] }),
    Technician.findAll({
      where: { ativo: true },
      order: [['nome', 'ASC']],
    }),
  ]);

  return { categorias, tecnicos };
}

async function findOr404(id, res, opts = {}) {
  const ticket = await Ticket.findByPk(id, opts);

  if (!ticket) {
    res.status(404).render('404', {
      title: 'Chamado não encontrado',
    });
  }

  return ticket;
}

// LISTAR CHAMADOS
exports.index = async (req, res) => {
  const { q, status, prioridade, categoria, tecnico } = req.query;
  const where = {};

  if (req.usuario.perfil === 'user') {
    where.uid = req.usuario.uid;
  }

  if (q) {
    const like = { [Op.like]: `%${q}%` };
    const or = [
      { titulo: like },
      { solicitante: like },
      { descricao: like },
    ];

    const idMatch = String(q).match(/^(?:CH-)?0*(\d+)$/i);

    if (idMatch) {
      or.push({ id: Number(idMatch[1]) });
    }

    where[Op.or] = or;
  }

  if (status === 'ativos') {
    where.status = {
      [Op.in]: ['aberto', 'em_andamento', 'aguardando'],
    };
  } else if (status && STATUS[status]) {
    where.status = status;
  }

  if (prioridade && PRIORIDADES[prioridade]) {
    where.prioridade = prioridade;
  }

  if (categoria) where.categoryId = categoria;

  if (tecnico === 'nenhum') {
    where.technicianId = null;
  } else if (tecnico) {
    where.technicianId = tecnico;
  }

  const tickets = await Ticket.findAll({
    where,
    include,
    order: [['createdAt', 'DESC']],
  });

  const opts = await formOptions();

  res.render('tickets/index', {
    title: 'Chamados',
    tickets,
    filtros: {
      q: q || '',
      status: status || '',
      prioridade: prioridade || '',
      categoria: categoria || '',
      tecnico: tecnico || '',
    },
    ...opts,
  });
};

// NOVO CHAMADO
exports.new = async (req, res) => {
  res.render('tickets/form', {
    title: 'Novo chamado',
    ticket: {
      prioridade: 'media',
      status: 'aberto',
    },
    errors: [],
    isEdit: false,
    ...(await formOptions()),
  });
};

// CRIAR CHAMADO
exports.create = async (req, res) => {
  const data = pickTicket(req.body);

  // A identidade do autor vem exclusivamente da sessão Firebase.
  data.uid = req.usuario.uid;
  data.solicitante = req.usuario.nome || req.usuario.email;
  data.emailSolicitante = req.usuario.email;

  // Todo chamado novo começa aberto e sem técnico responsável.
  data.status = 'aberto';
  data.technicianId = null;

  try {
    const ticket = await Ticket.create(data);

    await Comment.create({
      ticketId: ticket.id,
      autor: 'Sistema',
      tipo: 'sistema',
      mensagem: `Chamado aberto por ${ticket.solicitante}.`,
    });

    return res.redirect(
      `/tickets/${ticket.id}?msg=${encodeURIComponent(
        `Chamado ${ticket.protocolo} criado com sucesso!`
      )}`
    );
  } catch (err) {
    const errors = validationMessages(err);
    if (!errors) throw err;

    return res.status(422).render('tickets/form', {
      title: 'Novo chamado',
      ticket: data,
      errors,
      isEdit: false,
      ...(await formOptions()),
    });
  }
};

// VISUALIZAR CHAMADO
exports.show = async (req, res) => {
  const ticket = await findOr404(req.params.id, res, {
    include: [
      ...include,
      { model: Comment, as: 'comentarios' },
    ],
    order: [
      [{ model: Comment, as: 'comentarios' }, 'createdAt', 'ASC'],
    ],
  });

  if (!ticket) return;

  if (!podeVerChamado(req.usuario, ticket)) {
    return negarAcesso(res);
  }

  const { tecnicos } = await formOptions();

  res.render('tickets/show', {
    title: ticket.protocolo,
    ticket,
    tecnicos,
    errors: [],
  });
};

// EDITAR CHAMADO
exports.edit = async (req, res) => {
  if (!isAdmin(req.usuario)) {
    return negarAcesso(res);
  }

  const ticket = await findOr404(req.params.id, res);
  if (!ticket) return;

  res.render('tickets/form', {
    title: `Editar ${ticket.protocolo}`,
    ticket,
    errors: [],
    isEdit: true,
    ...(await formOptions()),
  });
};

// ATUALIZAR CHAMADO
exports.update = async (req, res) => {
  if (!isAdmin(req.usuario)) {
    return negarAcesso(res);
  }

  const ticket = await findOr404(req.params.id, res);
  if (!ticket) return;

  const data = pickTicket(req.body);

  try {
    await ticket.update(data);

    res.redirect(
      `/tickets/${ticket.id}?msg=${encodeURIComponent('Chamado atualizado.')}`
    );
  } catch (err) {
    const errors = validationMessages(err);
    if (!errors) throw err;

    res.status(422).render('tickets/form', {
      title: `Editar ${ticket.protocolo}`,
      ticket: {
        ...data,
        id: ticket.id,
        protocolo: ticket.protocolo,
      },
      errors,
      isEdit: true,
      ...(await formOptions()),
    });
  }
};

// ATUALIZAÇÃO RÁPIDA
exports.quickUpdate = async (req, res) => {
  const usuario = req.usuario;
  const admin = isAdmin(usuario);
  const tecnico = isTecnico(usuario);

  if (!admin && !tecnico) {
    return negarAcesso(res);
  }

  const ticket = await findOr404(req.params.id, res, { include });
  if (!ticket) return;

  const historico = [];
  const { status } = req.body;

  // Tecnicos podem usar somente os tres estados exigidos.
  const estadosTecnico = ['aberto', 'em_andamento', 'resolvido'];

  if (status) {
    if (!STATUS[status]) {
      return res.redirect(
        `/tickets/${ticket.id}?erro=${encodeURIComponent('Status inválido.')}`
      );
    }

    if (tecnico && !estadosTecnico.includes(status)) {
      return res.redirect(
        `/tickets/${ticket.id}?erro=${encodeURIComponent('Você não pode utilizar esse status.')}`
      );
    }

    if (status !== ticket.status) {
      historico.push(
        `Status alterado de "${STATUS[ticket.status].label}" para "${STATUS[status].label}".`
      );

      ticket.status = status;
    }
  }

  // Tecnico pode assumir somente o proprio chamado.
  if (tecnico && req.body.assumir === '1') {
    const tecnicosAtivos = await Technician.findAll({
      where: { ativo: true }
    });

    const tecnicoAtual = tecnicosAtivos.find(
      t => t.email.toLowerCase() === (usuario.email || '').toLowerCase()
    );

    if (!tecnicoAtual) {
      return res.redirect(
        `/tickets/${ticket.id}?erro=${encodeURIComponent('Seu usuário não está vinculado a um técnico ativo.')}`
      );
    }

    if (
      ticket.technicianId &&
      ticket.technicianId !== tecnicoAtual.id
    ) {
      return res.redirect(
        `/tickets/${ticket.id}?erro=${encodeURIComponent('Este chamado já está atribuído a outro técnico.')}`
      );
    }

    if (ticket.technicianId !== tecnicoAtual.id) {
      ticket.technicianId = tecnicoAtual.id;
      historico.push(`Chamado assumido por ${tecnicoAtual.nome}.`);
    }
  }

  // Somente administrador pode alterar prioridade e atribuir outros tecnicos.
  if (admin) {
    const { prioridade } = req.body;

    const technicianId = req.body.technicianId
      ? Number(req.body.technicianId)
      : null;

    if (
      prioridade &&
      PRIORIDADES[prioridade] &&
      prioridade !== ticket.prioridade
    ) {
      historico.push(
        `Prioridade alterada de "${PRIORIDADES[ticket.prioridade].label}" para "${PRIORIDADES[prioridade].label}".`
      );

      ticket.prioridade = prioridade;
    }

    if (technicianId !== ticket.technicianId) {
      const novo = technicianId
        ? await Technician.findByPk(technicianId)
        : null;

      if (technicianId && !novo) {
        return res.redirect(
          `/tickets/${ticket.id}?erro=${encodeURIComponent('Técnico inválido.')}`
        );
      }

      historico.push(
        novo
          ? `Chamado atribuído a ${novo.nome}.`
          : 'Técnico responsável removido.'
      );

      ticket.technicianId = novo ? novo.id : null;
    }
  }

  if (!historico.length) {
    return res.redirect(
      `/tickets/${ticket.id}?erro=${encodeURIComponent('Nenhuma alteração realizada.')}`
    );
  }

  await ticket.save();

  await Comment.bulkCreate(
    historico.map(mensagem => ({
      ticketId: ticket.id,
      autor: 'Sistema',
      tipo: 'sistema',
      mensagem
    }))
  );

  return res.redirect(
    `/tickets/${ticket.id}?msg=${encodeURIComponent('Chamado atualizado.')}`
  );
};

// EXCLUIR CHAMADO
exports.destroy = async (req, res) => {
  if (!isAdmin(req.usuario)) {
    return negarAcesso(res);
  }

  const ticket = await findOr404(req.params.id, res);
  if (!ticket) return;

  const protocolo = ticket.protocolo;

  await ticket.destroy();

  res.redirect(
    `/tickets?msg=${encodeURIComponent(`Chamado ${protocolo} excluído.`)}`
  );
};
