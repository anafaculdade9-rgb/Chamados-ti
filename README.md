# Chamados TI — Sistema de Gerenciamento de Chamados

**Autora:** Ana Clara Pereira Lima

**Aplicação publicada:** [https://chamados-ti-2zhf.onrender.com](https://chamados-ti-2zhf.onrender.com)

**Repositório GitHub:** [https://github.com/anafaculdade9-rgb/Chamados-ti](https://github.com/anafaculdade9-rgb/Chamados-ti)

## Sobre o projeto

O Chamados TI é um sistema web para abertura, acompanhamento e gerenciamento de chamados de suporte técnico. A aplicação permite que usuários registrem problemas, acompanhem o andamento das solicitações e que técnicos e administradores organizem os atendimentos.

O projeto foi desenvolvido utilizando Node.js, Express, EJS, JavaScript, HTML, CSS, Sequelize, SQLite e Firebase Authentication.

## Funcionalidades

- Autenticação de usuários.
- Abertura e acompanhamento de chamados.
- Histórico de atualizações e comentários.
- Controle de status e prioridade.
- Gerenciamento de técnicos e categorias.
- Atribuição de chamados aos técnicos.
- Painel administrativo com indicadores.
- Controle de acesso de acordo com o perfil do usuário.

### Perfis de acesso

- **Usuário:** abre chamados, acompanha suas solicitações e adiciona comentários.
- **Técnico:** visualiza os chamados e atualiza o andamento dos atendimentos.
- **Administrador:** gerencia usuários, técnicos, categorias e chamados.

## Configuração inicial do sistema

Após acessar a aplicação, é necessário realizar algumas configurações administrativas para que o sistema funcione corretamente.

1. Acesse a aplicação e entre com uma conta de administrador.
2. Na área de gerenciamento de usuários, localize a conta que será utilizada pela técnica Ana e altere seu perfil para `tecnico`.
3. Acesse a área de técnicos e cadastre a Ana, utilizando o mesmo nome e o mesmo e-mail da conta de acesso.
4. Acesse a área de categorias e cadastre as categorias que serão utilizadas na abertura dos chamados.
5. Após essas configurações, o sistema estará preparado para os testes de abertura e gerenciamento de chamados.

**Importante:** a alteração do perfil do usuário e o cadastro na área de técnicos são etapas diferentes. Para que a técnica consiga assumir chamados, o e-mail utilizado na autenticação deve corresponder ao e-mail cadastrado no registro de técnico.

Os chamados são criados inicialmente sem técnico atribuído. A atribuição pode ser realizada posteriormente pelo administrador.

## Como executar localmente

### Pré-requisitos

- Node.js 20 ou superior, com versão inferior à 23.
- npm.
- Credenciais de um projeto Firebase configurado para autenticação e Firestore.

### Instalação

Clone o repositório:

```bash
git clone https://github.com/anafaculdade9-rgb/Chamados-ti.git
```

Entre na pasta do projeto:

```bash
cd Chamados-ti
```

Instale as dependências:

```bash
npm install
```

Configure as credenciais do Firebase conforme a seção abaixo.

Inicie a aplicação:

```bash
npm start
```

Acesse:

```text
http://localhost:3000
```

Para executar em modo de desenvolvimento:

```bash
npm run dev
```

## Configuração do Firebase

A aplicação utiliza Firebase Authentication para autenticação e Firestore para armazenar informações dos usuários e seus perfis.

Para executar localmente, configure as credenciais administrativas do Firebase por meio de uma variável de ambiente ou do arquivo de credenciais esperado pelo projeto:

```text
config/firebase/serviceAccountKey.json
```

Também é possível configurar a variável de ambiente `FIREBASE_SERVICE_ACCOUNT` com o conteúdo JSON da chave de serviço.

**Atenção:** o arquivo de credenciais contém informações privadas. Ele não deve ser enviado ao GitHub nem compartilhado publicamente.

No Render, a variável `FIREBASE_SERVICE_ACCOUNT` deve estar configurada nas variáveis de ambiente do serviço.

## Banco de dados

O projeto utiliza SQLite com Sequelize para armazenar informações relacionadas aos chamados, técnicos, categorias e comentários.

O banco de dados local é criado automaticamente durante a inicialização da aplicação.

O projeto também possui um comando para criar dados de exemplo:

```bash
npm run seed
```

**Atenção:** esse comando recria o banco de dados e apaga os registros existentes antes de inserir os dados de demonstração. Utilize-o somente quando desejar reiniciar o banco local.

A aplicação publicada no Render utiliza armazenamento temporário para o SQLite. Portanto, os dados podem ser perdidos após reinicializações ou novos deploys.

## Tecnologias utilizadas

- **Node.js:** ambiente de execução.
- **Express:** estrutura para criação do servidor e das rotas.
- **EJS:** renderização das páginas.
- **JavaScript:** lógica da aplicação.
- **HTML e CSS:** estrutura e apresentação da interface.
- **Sequelize:** ORM para comunicação com o banco de dados.
- **SQLite:** banco de dados relacional.
- **Firebase Authentication:** autenticação de usuários.
- **Cloud Firestore:** armazenamento de informações e perfis dos usuários.

## Estrutura do projeto

```text
Chamados-ti/
├── app.js
├── config/
│   ├── database.js
│   └── firebase/
├── controllers/
├── middlewares/
├── models/
├── public/
│   ├── css/
│   └── js/
├── routes/
├── seeders/
├── utils/
├── views/
├── .gitignore
├── package.json
└── README.md
```

## Acesso para testes

As credenciais abaixo permitem testar os diferentes perfis de acesso da aplicação.

| Perfil | E-mail | Senha |
|---|---|---|
| Usuário | teste3@gmail.com | 654321 |
| Técnico | teste2@gmail.com | 123456 |
| Administrador | teste@gmail.com | 12345678 |

**Aplicação para testes:** [https://chamados-ti-2zhf.onrender.com](https://chamados-ti-2zhf.onrender.com)

## Testes realizados

Os testes foram realizados na aplicação publicada:

[https://chamados-ti-2zhf.onrender.com](https://chamados-ti-2zhf.onrender.com)

- [x] Login e logout dos três perfis.
- [x] Abertura de chamados por usuário.
- [x] Visualização dos chamados pelo usuário.
- [x] Inclusão de comentários.
- [x] Alteração de status pelo técnico.
- [x] Atribuição de chamados pelo administrador.
- [x] Cadastro e edição de técnicos.
- [x] Cadastro e edição de categorias.
- [x] Verificação das permissões de cada perfil.
- [x] Verificação da navegação e apresentação das páginas.

## Publicação

A aplicação está hospedada no Render e o código-fonte está disponível no GitHub.

**Link público:** [https://chamados-ti-2zhf.onrender.com](https://chamados-ti-2zhf.onrender.com)

**Repositório:** [https://github.com/anafaculdade9-rgb/Chamados-ti](https://github.com/anafaculdade9-rgb/Chamados-ti)
