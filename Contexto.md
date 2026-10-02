# Contexto do Projeto — Sistema de Gerenciamento de Tênis

## Objetivo
Desenvolver, testar, documentar e manter um sistema CRUD completo para gerenciamento de tênis com catálogo moderno, responsivo e intuitivo. O backend é construído com Node.js + Express + MongoDB (Mongoose) preparado para ambiente serverless na Vercel. O frontend é 100% puro (HTML, CSS e JavaScript Vanilla).

## Stack Tecnológica
- **Backend**: Node.js (v24), Express.js (v4.21), Mongoose (v8.12), dotenv, cors
- **Banco de Dados**: MongoDB (MongoDB Atlas em produção / suporte com fallback automático para `mongodb-memory-server` em desenvolvimento local e testes)
- **Frontend**: HTML5 semântico, CSS3 moderno (Vanilla CSS com design system de tokens, flexbox/grid, cards, animações), JavaScript puro (ES6+, Fetch API, Intl.NumberFormat)
- **Hospedagem e Serverless**: Preparado para Vercel Serverless Functions (`backend/vercel.json`, `vercel.json` raiz e `backend/api/index.js`)

## Modelo de Dados (Tenis)
- `marca`: String, obrigatória (2 a 50 caracteres), trim automático
- `modelo`: String, obrigatório (2 a 80 caracteres), trim automático
- `preco`: Number, obrigatório, estritamente maior que zero (`> 0`)
- `foto`: String, obrigatória, URL válida de imagem iniciando com `http://` ou `https://`
- `timestamps`: `createdAt` e `updatedAt` automáticos

## Estado Atual
- **PROJETO 100% CONCLUÍDO E TESTADO**.
- Todas as 8 fases do `Roadmap.md` foram executadas e validadas com sucesso.
- Servidor backend em execução local e respondendo na porta 3000.
- Suíte completa de testes automatizados com 39 asserções passando com 0 falhas.

## Funcionalidades Implementadas
- [x] Backend completo com Express, CORS e JSON parser
- [x] Endpoint `GET /api/health` para monitoramento de integridade
- [x] CRUD completo em `/api/tenis`:
  - `GET /api/tenis` (listagem ordenada)
  - `GET /api/tenis/:id` (busca individual com validação de ObjectId)
  - `POST /api/tenis` (criação com validações completas)
  - `PUT /api/tenis/:id` (atualização total/parcial com validações)
  - `DELETE /api/tenis/:id` (exclusão e confirmação)
- [x] Respostas JSON padronizadas (`{ success, data }` e `{ success, error }`) com códigos HTTP corretos (200, 201, 400, 404, 500)
- [x] Conexão com MongoDB otimizada para Serverless Vercel (reutilização de conexões e cache global)
- [x] Frontend moderno em Vanilla HTML/CSS/JS:
  - Header com indicação em tempo real do status da API (Online/Offline)
  - Hero com métricas em tempo real (Total de Tênis e Preço Médio)
  - Formulário duplo (Modo Cadastro e Modo Edição com botão de cancelamento)
  - Chips de preenchimento rápido (Nike, Adidas, Puma, Jordan) para teste imediato
  - Pré-visualização da imagem em tempo real
  - Cards interativos com badges de marca, modelo, botões de ação e preço formatado em BRL (`R$ 799,90`)
  - Barra de busca em tempo real por marca/modelo e dropdown de filtro por marca
  - Notificações flutuantes (Toast system)
  - Skeleton loaders para transição de carregamento
  - Modal de confirmação para exclusão de tênis
  - Banner de erro claro caso a API esteja offline (sem uso de dados fictícios silenciosos)
- [x] Roteamento duplo para Vercel e execução local direta (servidor Express serve tanto a API quanto o frontend estático)
- [x] Documentações completas: `Roadmap.md`, `Contexto.md`, `api.md`, `README.md` e `.gitignore`

## Decisões Técnicas
- **Serverless Database Connection**: Implementado padrão de cache de conexão Mongoose (`cached.conn` / `cached.promise`) em variável global para evitar vazamento ou exaustão de conexões no ambiente serverless da Vercel.
- **Formatação de Preço**: O valor no banco de dados e nas requisições/respostas da API é sempre numérico (ex: `799.90`), enquanto a interface do frontend exibe a formatação localizada em Real (`R$ 799,90` com `Intl.NumberFormat`).
- **Respostas Padronizadas**: Todas as rotas da API retornam JSON padronizado com `{ success: true, data: ... }` ou `{ success: false, error: ... }`, com códigos HTTP semânticos (200, 201, 400, 404, 500).
- **Fallback de Banco em Desenvolvimento**: Quando a variável `MONGODB_URI` não está configurada em ambiente de desenvolvimento local, o sistema ativa uma instância em memória (`mongodb-memory-server`) para permitir testes imediatos sem bloquear o desenvolvedor. Em produção (Vercel), a variável é estritamente exigida.

## Problemas Encontrados e Soluções
1. *MongoDB local não instalado no PATH da máquina*:
   - *Solução*: Foi implementado suporte ao `mongodb-memory-server` em dev/testes e documentada a conexão com MongoDB Atlas via `MONGODB_URI` para produção.
2. *Browser subagent retornou código 503 de capacidade da API de modelo*:
   - *Solução*: A verificação de rotas e entrega de arquivos estáticos foi executada via script HTTP direto contra `http://localhost:3000`, confirmando que todos os arquivos (`/`, `/style.css`, `/script.js`, `/api/health`, `/api/tenis`) respondem com status 200 e headers adequados.

## Informações para Próximos Desenvolvedores
- Para rodar tudo localmente: basta rodar `npm run dev` na raiz e acessar `http://localhost:3000`.
- Para rodar a suíte de testes: `npm test`.
- Para deploy na Vercel: basta importar o repositório e adicionar a variável de ambiente `MONGODB_URI`.
