const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Comment = sequelize.define(
  'Comment',
  {
    autor: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Informe o autor do comentário.'
        }
      },
    },

    mensagem: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'O comentário não pode ficar vazio.'
        }
      },
    },

    // comentario = mensagem comum
    // parecer = parecer tecnico
    // sistema = historico automatico
    tipo: {
      type: DataTypes.ENUM('comentario', 'parecer', 'sistema'),
      allowNull: false,
      defaultValue: 'comentario',
    },
  },
  {
    tableName: 'comentarios'
  }
);

module.exports = Comment;
