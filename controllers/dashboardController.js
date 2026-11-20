const { Op } = require('sequelize');
const { Ticket, Technician, Category } = require('../models');
const { STATUS, PRIORIDADES, STATUS_ATIVOS } = require('../config/constants');

exports.index = async (req, res) => {
  const usuario = req.usuario;
  const esUsuario = usuario.perfil === 'user';

  // Usuario comum: todas as consultas ficam restritas ao proprio UID.
  const filtroUsuario = esUsuario ? { uid: usuario.uid } : {};

  // Contagem por status.
  const porStatus = {};

  for (const s of Object.keys(STATUS)) {
    porStatus[s] = await Ticket.count({
      where: { ...filtroUsuario, status: s }
    });
  }

  const total = Object.values(porStatus).reduce((a, b) => a + b, 0);
  const ativos = STATUS_ATIVOS.reduce((acc, s) => acc + porStatus[s], 0);

  // Chamados ativos por prioridade.
  const porPrioridade = {};

  for (const p of Object.keys(PRIORIDADES)) {
    porPrioridade[p] = await Ticket.count({
      where: {
        ...filtroUsuario,
        prioridade: p,
        status: { [Op.in]: STATUS_ATIVOS }
      }
    });
  }

  const include = [
    { model: Category, as: 'categoria' },
    { model: Technician, as: 'tecnico' },
  ];

  // Fila prioritária.
  const prioritarios = await Ticket.findAll({
    where: {
      ...filtroUsuario,
      prioridade: { [Op.in]: ['critica', 'alta'] },
      status: { [Op.in]: STATUS_ATIVOS }
    },
    include,
    order: [['createdAt', 'ASC']],
    limit: 5,
  });

  // Chamados recentes.
  const recentes = await Ticket.findAll({
    where: filtroUsuario,
    include,
    order: [['createdAt', 'DESC']],
    limit: 6
  });

  const semTecnico = await Ticket.count({
    where: {
      ...filtroUsuario,
      technicianId: null,
      status: { [Op.in]: STATUS_ATIVOS }
    },
  });

  let tecnicos = [];
  let categorias = [];
  let tempoMedio = null;

  // Somente tecnico e administrador recebem dados gerais da equipe.
  if (!esUsuario) {
    const tecnicosRaw = await Technician.findAll({
      where: { ativo: true },
      include: [
        {
          model: Ticket,
          as: 'tickets',
          attributes: ['id', 'status'],
          required: false
        }
      ],
      order: [['nome', 'ASC']],
    });

    tecnicos = tecnicosRaw
      .map((t) => ({
        nome: t.nome,
        iniciais: t.iniciais,
        ativos: t.tickets.filter((x) => STATUS_ATIVOS.includes(x.status)).length,
        resolvidos: t.tickets.filter((x) => !STATUS_ATIVOS.includes(x.status)).length,
      }))
      .sort((a, b) => b.ativos - a.ativos);

    const categoriasRaw = await Category.findAll({
      include: [
        {
          model: Ticket,
          as: 'tickets',
          attributes: ['id'],
          required: false
        }
      ],
    });

    categorias = categoriasRaw
      .map((c) => ({
        nome: c.nome,
        cor: c.cor,
        total: c.tickets.length
      }))
      .sort((a, b) => b.total - a.total);
  }

  // Tempo medio de resolucao.
  const resolvidos = await Ticket.findAll({
    where: {
      ...filtroUsuario,
      resolvidoEm: { [Op.ne]: null }
    },
    attributes: ['createdAt', 'resolvidoEm'],
  });

  tempoMedio = resolvidos.length
    ? resolvidos.reduce(
        (acc, t) => acc + (t.resolvidoEm - t.createdAt),
        0
      ) / resolvidos.length / 36e5
    : null;

  return res.render('dashboard', {
    title: 'Dashboard',
    total,
    ativos,
    porStatus,
    porPrioridade,
    prioritarios,
    recentes,
    semTecnico,
    tecnicos,
    categorias,
    tempoMedio,
  });
};
