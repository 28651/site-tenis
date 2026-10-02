# 👟 SneakerHub — Sistema de Gerenciamento de Tênis

Mini sistema full-stack completo para **catálogo e gerenciamento CRUD de tênis**, desenvolvido com arquitetura modular, backend em **Node.js + Express + MongoDB** preparado para **Vercel Serverless**, e um frontend moderno e responsivo em **HTML5, CSS3 e JavaScript puro**.

---

## 📌 Sumário
1. [Sobre o Projeto](#-sobre-o-projeto)
2. [Tecnologias Utilizadas](#-tecnologias-utilizadas)
3. [Estrutura de Diretórios](#-estrutura-de-diretórios)
4. [Pré-requisitos](#-pré-requisitos)
5. [Instalação e Configuração](#-instalação-e-configuração)
6. [Execução do Projeto](#-execução-do-projeto)
7. [Como Testar](#-como-testar)
8. [Deploy na Vercel](#-deploy-na-vercel)
9. [Documentação dos Endpoints (Resumo)](#-documentação-dos-endpoints-resumo)

---

## 📖 Sobre o Projeto

O **SneakerHub** foi desenvolvido como uma solução prática, visual e robusta para o gerenciamento de produtos no segmento de calçados esportivos.

### Recursos Implementados:
- **Catálogo Interativo**: Exibição dos tênis em cards modernos com foto, marca, modelo e preço.
- **Formatação de Moeda**: Preços exibidos no padrão brasileiro (`R$ 799,90`), mantendo armazenamento estritamente numérico no banco de dados (`799.90`).
- **Operações CRUD Completas**:
  - Cadastro de novos modelos com validações estritas de schema.
  - Listagem geral ordenada por data de inserção.
  - Busca detalhada por ID com tratamento específico para ObjectIds inválidos.
  - Edição com preenchimento automático do formulário.
  - Exclusão com modal de confirmação.
- **Filtros e Busca em Tempo Real**: Filtro instantâneo por marca e campo de busca rápida por texto.
- **Pré-visualização de Imagem em Tempo Real**: Prévia da foto exibida no formulário à medida que a URL é inserida.
- **Sugestões Rápidas (Chips)**: Preenchimento com um clique de modelos clássicos (Nike, Adidas, Puma, Jordan) para agilizar testes.
- **Feedback ao Usuário**: Notificações flutuantes (Toasts), skeleton loaders durante o carregamento e estados vazios amigáveis.
- **Sem Dados Fictícios Silenciosos**: Quando a API está indisponível, a interface exibe um banner de alerta claro com botão para tentar novamente.

---

## 🛠 Tecnologias Utilizadas

### Backend
- **Node.js** (Ambiente de execução)
- **Express.js** (Framework HTTP minimalista)
- **MongoDB & Mongoose** (Modelagem de dados e persistência NoSQL)
- **dotenv** (Gerenciamento seguro de variáveis de ambiente)
- **CORS** (Controle de acesso HTTP entre origens)
- **mongodb-memory-server** (Banco em memória integrado para desenvolvimento local ágil e suíte de testes automatizados)

### Frontend
- **HTML5** (Semântica acessível e SEO)
- **CSS3** (Design system em Vanilla CSS com dark mode, glassmorphism, flexbox/grid e micro-animações)
- **JavaScript Puro / Vanilla ES6+** (Consumo da API REST nativo via `fetch()`, manipulação do DOM e formatação `Intl.NumberFormat`)

---

## 📂 Estrutura de Diretórios

```text
site-tenis/
├── backend/
│   ├── api/
│   │   └── index.js              # Entrypoint serverless para Vercel
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js       # Conexão MongoDB com pool/cache serverless
│   │   ├── controllers/
│   │   │   └── tenisController.js # Lógica de negócio e operações CRUD
│   │   ├── models/
│   │   │   └── Tenis.js          # Schema e validações Mongoose
│   │   ├── routes/
│   │   │   └── tenisRoutes.js    # Definição das rotas REST
│   │   └── app.js                # Configuração do Express, middlewares e rotas estáticas
│   ├── tests/
│   │   └── api.test.js           # Suíte de testes automatizados de integração
│   ├── .env.example              # Exemplo de variáveis de ambiente
│   ├── package.json              # Dependências e scripts do backend
│   └── vercel.json               # Configuração serverless individual da pasta backend
│
├── frontend/
│   ├── index.html                # Estrutura da página do catálogo
│   ├── style.css                 # Folha de estilos moderna
│   └── script.js                 # Lógica de integração e interatividade
│
├── vercel.json                   # Configuração serverless raiz para deploy unificado
├── package.json                  # Scripts de conveniência na raiz
├── .gitignore                    # Arquivos ignorados pelo Git
├── Roadmap.md                    # Plano oficial de desenvolvimento e status das fases
├── Contexto.md                   # Memória técnica e decisões do projeto
├── api.md                        # Documentação completa de cada endpoint da API
└── README.md                     # Documentação geral do repositório
```

---

## ⚙️ Pré-requisitos

- **Node.js**: v18.0.0 ou superior (testado e homologado no Node v24).
- **npm**: v9.0.0 ou superior.
- **Cluster MongoDB Atlas** (opcional para testes imediatos, obrigatório para produção).

---

## 🚀 Instalação e Configuração

### 1. Clonar o repositório ou abrir a pasta do projeto:
```bash
cd site-tenis
```

### 2. Instalar as dependências:
Você pode instalar diretamente na pasta raiz ou no diretório do backend:
```bash
cd backend
npm install
```

### 3. Configurar as variáveis de ambiente:
Crie o arquivo `.env` dentro da pasta `backend/` com base no arquivo `.env.example`:
```bash
# No Windows (PowerShell)
cp .env.example .env
```

Edite o arquivo `backend/.env`:
```env
PORT=3000
MONGODB_URI=mongodb+srv://seu_usuario:sua_senha@cluster0.mongodb.net/tenis?retryWrites=true&w=majority
```

> **Nota de Conveniência**: Se você iniciar o servidor localmente **sem** configurar a variável `MONGODB_URI`, o sistema detectará o ambiente de desenvolvimento e inicializará automaticamente um MongoDB em memória (`mongodb-memory-server`), permitindo que você teste o sistema imediatamente sem nenhuma configuração externa prévia!

---

## 💻 Execução do Projeto

### Opção 1: Iniciar o servidor integrado (Recomendado)
A partir da raiz do projeto:
```bash
npm run dev
```
ou dentro de `backend/`:
```bash
cd backend
npm run dev
```

Abra o seu navegador em:
- **Frontend / Aplicação**: [http://localhost:3000](http://localhost:3000)
- **API Health Check**: [http://localhost:3000/api/health](http://localhost:3000/api/health)
- **Listagem de Tênis**: [http://localhost:3000/api/tenis](http://localhost:3000/api/tenis)

### Opção 2: Executar o Frontend Separadamente
Caso prefira servir o frontend por um servidor web separado (como a extensão Live Server do VS Code ou `npx serve frontend` na porta 5500 ou 8080):
- Mantenha o backend rodando na porta 3000 (`http://localhost:3000`).
- Abra o `frontend/index.html` em seu servidor estático. O CORS já está habilitado no backend para permitir requisições de origens cruzadas.

---

## 🧪 Como Testar

O projeto conta com uma suíte de testes de integração automatizada que valida:
1. Conexão real com MongoDB;
2. `GET /api/health`;
3. `GET /api/tenis` com catálogo vazio;
4. `POST /api/tenis` criando registros válidos;
5. `GET /api/tenis/:id` recuperando o documento criado;
6. `PUT /api/tenis/:id` atualizando dados;
7. Validações de entrada: ausência de marca, ausência de modelo, preço negativo, preço em texto e URLs de foto inválidas;
8. Tratamento de ID de MongoDB inválido (`400 Bad Request`);
9. Tratamento de ID inexistente (`404 Not Found`);
10. `DELETE /api/tenis/:id` e confirmação de remoção;
11. Resposta para rotas inexistentes (`404 Not Found`).

Para executar a bateria de testes:
```bash
npm test
# ou dentro de backend/:
cd backend
npm test
```

---

## ☁️ Deploy na Vercel

O projeto foi estruturado com suporte nativo a serverless functions da Vercel.

### Passo 1: Subir o código para o GitHub
```bash
git init
git add .
git commit -m "feat: implementacao completa do sistema de tenis"
git remote add origin https://github.com/seu-usuario/seu-repositorio.git
git push -u origin main
```

### Passo 2: Importar o Projeto na Vercel
1. Acesse o painel da [Vercel](https://vercel.com/) e clique em **Add New... > Project**.
2. Conecte sua conta do GitHub e selecione o repositório.
3. Nas configurações do projeto (**Project Settings**):
   - **Framework Preset**: Deixe em *Other*.
   - **Root Directory**: Pode manter `./` (pois configuramos o `vercel.json` na raiz) ou definir `backend` caso queira hospedar apenas a API.
4. Na seção **Environment Variables**, adicione obrigatoriamente:
   - `MONGODB_URI`: Sua string de conexão do MongoDB Atlas.

### Passo 3: Conectar o Frontend com a URL de Produção
No arquivo `frontend/script.js`, a constante `API_URL` já detecta automaticamente se está rodando em um domínio `*.vercel.app` para utilizar `/api`. Caso publique o frontend em domínio próprio diferente da API, basta atualizar a constante:
```javascript
const API_URL = "https://sua-api.vercel.app/api";
```

---

## 📡 Documentação dos Endpoints (Resumo)

| Método | Endpoint | Descrição | Status HTTP |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Status de integridade da API | `200 OK` |
| `GET` | `/api/tenis` | Lista todos os tênis ordenados por data | `200 OK` |
| `GET` | `/api/tenis/:id` | Busca detalhes de um tênis por ID | `200 OK` / `400` / `404` |
| `POST` | `/api/tenis` | Cadastra um novo tênis | `201 Created` / `400` |
| `PUT` | `/api/tenis/:id` | Atualiza um tênis existente | `200 OK` / `400` / `404` |
| `DELETE` | `/api/tenis/:id` | Remove um tênis do catálogo | `200 OK` / `400` / `404` |

Para exemplos detalhados de requisição e resposta JSON, consulte o arquivo [api.md](file:///c:/Users/Aluno/Desktop/site-tenis/api.md).

---

## 📄 Licença
Distribuído sob a licença ISC. Desenvolvido para fins educacionais e de demonstração prática.
