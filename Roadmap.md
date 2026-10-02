# Roadmap do Projeto — Sistema de Gerenciamento de Tênis

Este documento é o plano oficial de desenvolvimento do agente para o projeto. Ele é atualizado continuamente conforme as etapas são executadas e verificadas.

---

## Fase 1 — Inicialização
- [x] Criar estrutura de diretórios do projeto
- [x] Inicializar package.json do backend
- [x] Configurar dependências necessárias (express, mongoose, dotenv, cors)
- [x] Configurar Git e arquivo .gitignore
- [x] Criar arquivo .env.example

## Fase 2 — Banco de Dados
- [x] Criar módulo de conexão com MongoDB com suporte a serverless (caching de conexão)
- [x] Criar Model Tenis com Mongoose (marca, modelo, preco, foto, timestamps)
- [x] Configurar regras e validações no Model e Controller
- [x] Validar conexão e tratamento para ausência de MONGODB_URI

## Fase 3 — API REST
- [x] Configurar Express app, middlewares (express.json, cors) e rotas
- [x] Implementar endpoint GET /api/health
- [x] Implementar controller tenisController.js
- [x] Implementar GET /api/tenis (listar todos os tênis)
- [x] Implementar GET /api/tenis/:id (buscar por ID com tratamento de ObjectId inválido)
- [x] Implementar POST /api/tenis (criar tênis com validação de dados)
- [x] Implementar PUT /api/tenis/:id (atualizar tênis com validação)
- [x] Implementar DELETE /api/tenis/:id (excluir tênis)
- [x] Implementar tratamento centralizado de erros e respostas JSON padronizadas ({ success, data/error })
- [x] Configurar entrypoint serverless para Vercel em backend/api/index.js e vercel.json

## Fase 4 — Frontend
- [x] Criar estrutura de arquivos em frontend/ (index.html, style.css, script.js)
- [x] Desenvolver layout responsivo com visual moderno de catálogo de tênis
- [x] Implementar formulário de cadastro/edição (Marca, Modelo, Preço, Foto)
- [x] Implementar exibição em cards com imagem, marca, modelo, preço formatado em R$ e botões de ação
- [x] Implementar consumo da API via fetch com suporte a API_URL configurável
- [x] Implementar estados de carregamento (loading spinner / skeleton)
- [x] Implementar mensagens visuais de sucesso e erro (toasts ou alerts estilizados)
- [x] Implementar estado vazio caso não haja tênis cadastrados
- [x] Implementar modal ou inline switch para edição e exclusão com confirmação

## Fase 5 — Testes
- [x] Testar conexão com banco de dados
- [x] Testar endpoint GET /api/health
- [x] Testar GET /api/tenis
- [x] Testar POST /api/tenis com dados válidos
- [x] Testar GET /api/tenis/:id com ID recém-criado
- [x] Testar PUT /api/tenis/:id atualizando valores
- [x] Testar DELETE /api/tenis/:id excluindo o registro
- [x] Testar validações (marca/modelo vazios, preço negativo/não numérico, URL inválida)
- [x] Testar tratamento para IDs inválidos e inexistentes
- [x] Testar interface frontend no navegador (listagem, cadastro, edição, exclusão, formatação)

## Fase 6 — Vercel e Deploy
- [x] Configurar backend/vercel.json e/ou vercel.json raiz
- [x] Garantir compatibilidade total com o runtime serverless Node.js
- [x] Documentar configuração de variáveis de ambiente no painel da Vercel

## Fase 7 — Documentação
- [x] Criar Contexto.md com detalhes técnicos e memória do projeto
- [x] Criar api.md com documentação detalhada de cada endpoint e exemplos de requisição/resposta
- [x] Criar README.md completo com instruções de instalação, execução, configuração e deploy
- [x] Revisar e validar sincronia de todos os documentos

## Fase 8 — Revisão Final
- [x] Executar bateria completa de testes automatizados e funcionais
- [x] Revisar conformidade do código com todas as regras do projeto
- [x] Confirmar funcionamento geral e entrega final
