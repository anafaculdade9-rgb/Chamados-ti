const sequelize = require('../config/database');

async function migrar() {
  try {
    const colunas = await sequelize
      .getQueryInterface()
      .describeTable('chamados');

    if (!colunas.uid) {
      await sequelize
        .getQueryInterface()
        .addColumn('chamados', 'uid', {
          type: 'VARCHAR(255)',
          allowNull: true,
        });

      console.log('Coluna uid adicionada com sucesso.');
    } else {
      console.log('A coluna uid já existe.');
    }
  } catch (erro) {
    console.error('Erro na migração:', erro);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

migrar();
