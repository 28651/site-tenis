# Documentação Oficial da API — Sistema de Gerenciamento de Tênis

API RESTful completa desenvolvida em Node.js com Express e MongoDB (Mongoose), preparada para execução local e deployment serverless na Vercel.

---

## 1. Visão Geral e Endpoints

### URLs Base

- **Ambiente de Desenvolvimento Local**: `http://localhost:3000/api`
- **Ambiente de Produção (Vercel)**: `https://seu-projeto.vercel.app/api`

### Resumo dos Endpoints

| Método | Rota | Descrição | Status de Sucesso |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Verificação de integridade da API | `200 OK` |
| `GET` | `/api/tenis` | Listar todos os tênis cadastrados | `200 OK` |
| `GET` | `/api/tenis/:id` | Obter detalhes de um tênis específico | `200 OK` |
| `POST` | `/api/tenis` | Cadastrar um novo tênis no catálogo | `201 Created` |
| `PUT` | `/api/tenis/:id` | Atualizar dados de um tênis existente | `200 OK` |
| `DELETE` | `/api/tenis/:id` | Excluir um tênis do catálogo | `200 OK` |

---

## 2. Padrão de Respostas

Todas as respostas da API seguem um formato JSON previsível e padronizado:

### Sucesso
```json
{
  "success": true,
  "data": {}
}
```

### Erro
```json
{
  "success": false,
  "error": "Descrição detalhada do erro ocorrido"
}
```

### Códigos de Status HTTP Utilizados

- `200 OK`: Operação executada com sucesso (busca, listagem, atualização ou exclusão).
- `201 Created`: Recurso criado com sucesso no banco de dados.
- `400 Bad Request`: Dados ausentes, campos inválidos, formato JSON corrompido ou ID do MongoDB inválido.
- `404 Not Found`: Tênis ou rota requisitada não encontrados.
- `500 Internal Server Error`: Erro inesperado do servidor ou falha de infraestrutura.

---

## 3. Detalhamento dos Endpoints

### 3.1 Health Check
Verifica se a API está online e respondendo adequadamente.

- **Método**: `GET`
- **Endpoint**: `/api/health`
- **Autenticação**: Nenhuma

#### Resposta de Sucesso (`200 OK`):
```json
{
  "status": "ok",
  "message": "API funcionando"
}
```

---

### 3.2 Listar Todos os Tênis
Recupera todos os modelos de tênis cadastrados, ordenados do mais recente para o mais antigo.

- **Método**: `GET`
- **Endpoint**: `/api/tenis`
- **Query Params**: Nenhum

#### Resposta de Sucesso (`200 OK`):
```json
{
  "success": true,
  "data": [
    {
      "_id": "651f8a9e7d23a1c8f45b9123",
      "marca": "Nike",
      "modelo": "Air Max 270",
      "preco": 799.90,
      "foto": "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
      "createdAt": "2026-10-02T10:00:00.000Z",
      "updatedAt": "2026-10-02T10:00:00.000Z"
    }
  ]
}
```

Caso não haja registros, `data` retorna uma lista vazia `[]`.

---

### 3.3 Buscar Tênis por ID
Recupera os detalhes de um tênis específico a partir de seu `_id` do MongoDB.

- **Método**: `GET`
- **Endpoint**: `/api/tenis/:id`

#### Parâmetros de URL:
- `id` (string, obrigatório): ID de 24 caracteres hexadecimais no padrão ObjectId do MongoDB.

#### Resposta de Sucesso (`200 OK`):
```json
{
  "success": true,
  "data": {
    "_id": "651f8a9e7d23a1c8f45b9123",
    "marca": "Nike",
    "modelo": "Air Max 270",
    "preco": 799.90,
    "foto": "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    "createdAt": "2026-10-02T10:00:00.000Z",
    "updatedAt": "2026-10-02T10:00:00.000Z"
  }
}
```

#### Possíveis Erros:
- `400 Bad Request` (ID inválido):
```json
{
  "success": false,
  "error": "ID inválido fornecido."
}
```
- `404 Not Found` (Registro não existe):
```json
{
  "success": false,
  "error": "Tênis não encontrado."
}
```

---

### 3.4 Cadastrar Tênis
Adiciona um novo modelo ao catálogo.

- **Método**: `POST`
- **Endpoint**: `/api/tenis`
- **Headers**: `Content-Type: application/json`

#### Corpo da Requisição (Body JSON):
```json
{
  "marca": "Adidas",
  "modelo": "Ultraboost Light",
  "preco": 899.99,
  "foto": "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb"
}
```

#### Regras de Validação:
- `marca`: Obrigatória, texto não vazio, de 2 a 50 caracteres.
- `modelo`: Obrigatório, texto não vazio, de 2 a 80 caracteres.
- `preco`: Obrigatório, numérico, estritamente maior que zero (`preco > 0`).
- `foto`: Obrigatória, URL válida iniciando com `http://` ou `https://`.

#### Resposta de Sucesso (`201 Created`):
```json
{
  "success": true,
  "data": {
    "_id": "651f8b1e7d23a1c8f45b9456",
    "marca": "Adidas",
    "modelo": "Ultraboost Light",
    "preco": 899.99,
    "foto": "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb",
    "createdAt": "2026-10-02T10:05:00.000Z",
    "updatedAt": "2026-10-02T10:05:00.000Z"
  }
}
```

#### Possíveis Erros (`400 Bad Request`):
```json
{
  "success": false,
  "error": "O preço deve ser um número maior que zero."
}
```

---

### 3.5 Atualizar Tênis
Atualiza um ou mais campos de um tênis previamente cadastrado.

- **Método**: `PUT`
- **Endpoint**: `/api/tenis/:id`
- **Headers**: `Content-Type: application/json`

#### Corpo da Requisição (Body JSON - campos opcionais para atualização parcial):
```json
{
  "preco": 749.90,
  "foto": "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
}
```

#### Resposta de Sucesso (`200 OK`):
```json
{
  "success": true,
  "data": {
    "_id": "651f8a9e7d23a1c8f45b9123",
    "marca": "Nike",
    "modelo": "Air Max 270",
    "preco": 749.90,
    "foto": "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    "createdAt": "2026-10-02T10:00:00.000Z",
    "updatedAt": "2026-10-02T10:15:00.000Z"
  }
}
```

#### Possíveis Erros:
- `400 Bad Request`: Parâmetros inválidos ou ID com formato incorreto.
- `404 Not Found`: Tênis correspondente ao ID informado não existe.

---

### 3.6 Excluir Tênis
Remove definitivamente um tênis do catálogo.

- **Método**: `DELETE`
- **Endpoint**: `/api/tenis/:id`

#### Resposta de Sucesso (`200 OK`):
```json
{
  "success": true,
  "data": {
    "message": "Tênis removido com sucesso.",
    "id": "651f8a9e7d23a1c8f45b9123"
  }
}
```

#### Possíveis Erros:
- `400 Bad Request`: ID inválido.
- `404 Not Found`: Registro não encontrado.

---

## 4. Configuração e Execução Local

### Pré-requisitos
- Node.js (v18+)
- MongoDB Atlas (cluster gratuito) ou MongoDB local

### Passos para Configuração

1. Entre no diretório do backend:
   ```bash
   cd backend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie seu arquivo `.env` a partir do modelo `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Edite o `.env` informando sua string de conexão:
   ```env
   PORT=3000
   MONGODB_URI=mongodb+srv://seu_usuario:sua_senha@cluster0.mongodb.net/tenis?retryWrites=true&w=majority
   ```
5. Inicie o servidor:
   ```bash
   npm run dev
   ```

---

## 5. Testes da API

A aplicação inclui uma suíte de testes automatizados abrangentes que validam todos os endpoints, operações CRUD, validações de schema e tratamento de exceções.

Para executar os testes:
```bash
npm test
```
