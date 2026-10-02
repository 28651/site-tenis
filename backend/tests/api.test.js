/**
 * Suíte de Testes Automatizados da API de Tênis
 * Executa testes reais de integração contra um servidor Express e MongoDB em memória.
 */

const http = require('http');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const connectDB = require('../src/config/database');

let mongoServer;
let server;
let baseUrl;

/**
 * Função auxiliar para disparar requisições HTTP sem depender de bibliotecas externas
 */
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(baseUrl + path);
    const options = {
      method: method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: parsed,
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

// Contador de testes
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    failed++;
    console.error(`  ❌ FALHA: ${message}`);
    throw new Error(message);
  } else {
    passed++;
    console.log(`  ✅ PASSOU: ${message}`);
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🚀 INICIANDO BATERIA DE TESTES DA API DE TÊNIS');
  console.log('======================================================\n');

  try {
    // 1. Inicializar MongoDB em memória e configurar conexão
    console.log('📦 Inicializando MongoDB em memória...');
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    process.env.MONGODB_URI = uri;
    await connectDB(uri);

    // 2. Iniciar servidor Express em porta randômica
    server = app.listen(0);
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
    console.log(`🌐 Servidor de testes rodando em: ${baseUrl}\n`);

    // -------------------------------------------------------------
    // Teste 1: Health Check
    // -------------------------------------------------------------
    console.log('--- TESTE 1: GET /api/health ---');
    const healthRes = await makeRequest('GET', '/api/health');
    assert(healthRes.status === 200, `Health check status deve ser 200 (retornou ${healthRes.status})`);
    assert(healthRes.body.status === 'ok', 'Health check body.status deve ser "ok"');
    assert(healthRes.body.message === 'API funcionando', 'Health check mensagem correta');

    // -------------------------------------------------------------
    // Teste 2: Listagem inicial (catálogo vazio)
    // -------------------------------------------------------------
    console.log('\n--- TESTE 2: GET /api/tenis (Catálogo Inicial Vazio) ---');
    const listEmptyRes = await makeRequest('GET', '/api/tenis');
    assert(listEmptyRes.status === 200, 'Status deve ser 200');
    assert(listEmptyRes.body.success === true, 'success deve ser true');
    assert(Array.isArray(listEmptyRes.body.data) && listEmptyRes.body.data.length === 0, 'data deve ser array vazio');

    // -------------------------------------------------------------
    // Teste 3: Criação de Tênis (POST /api/tenis)
    // -------------------------------------------------------------
    console.log('\n--- TESTE 3: POST /api/tenis (Criação de Tênis Válido) ---');
    const novoTenis = {
      marca: 'Nike',
      modelo: 'Air Max 270',
      preco: 799.90,
      foto: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
    };
    const createRes = await makeRequest('POST', '/api/tenis', novoTenis);
    assert(createRes.status === 201, `Criação deve retornar 201 Created (retornou ${createRes.status})`);
    assert(createRes.body.success === true, 'success deve ser true');
    assert(createRes.body.data.marca === 'Nike', 'marca deve ser Nike');
    assert(createRes.body.data.modelo === 'Air Max 270', 'modelo deve ser Air Max 270');
    assert(createRes.body.data.preco === 799.90, 'preco deve ser 799.90');
    assert(createRes.body.data.foto === novoTenis.foto, 'foto deve coincidir');
    assert(!!createRes.body.data._id, '_id do MongoDB deve ter sido gerado');
    assert(!!createRes.body.data.createdAt, 'timestamp createdAt deve existir');

    const createdId = createRes.body.data._id;

    // -------------------------------------------------------------
    // Teste 4: Busca por ID (GET /api/tenis/:id)
    // -------------------------------------------------------------
    console.log('\n--- TESTE 4: GET /api/tenis/:id (Buscar Tênis Criado) ---');
    const getRes = await makeRequest('GET', `/api/tenis/${createdId}`);
    assert(getRes.status === 200, 'Status deve ser 200');
    assert(getRes.body.success === true, 'success deve ser true');
    assert(getRes.body.data._id === createdId, 'ID retornado deve ser idêntico');
    assert(getRes.body.data.modelo === 'Air Max 270', 'modelo deve ser Air Max 270');

    // -------------------------------------------------------------
    // Teste 5: Listagem com itens (GET /api/tenis)
    // -------------------------------------------------------------
    console.log('\n--- TESTE 5: GET /api/tenis (Listagem com Tênis Criado) ---');
    const listRes = await makeRequest('GET', '/api/tenis');
    assert(listRes.status === 200, 'Status deve ser 200');
    assert(listRes.body.data.length === 1, 'Array deve conter exatamente 1 tênis');
    assert(listRes.body.data[0]._id === createdId, 'Primeiro item deve ter o ID criado');

    // -------------------------------------------------------------
    // Teste 6: Atualização (PUT /api/tenis/:id)
    // -------------------------------------------------------------
    console.log('\n--- TESTE 6: PUT /api/tenis/:id (Atualizar Tênis) ---');
    const updatePayload = {
      preco: 749.90,
      modelo: 'Air Max 270 React',
    };
    const putRes = await makeRequest('PUT', `/api/tenis/${createdId}`, updatePayload);
    assert(putRes.status === 200, `Atualização deve retornar 200 (retornou ${putRes.status})`);
    assert(putRes.body.success === true, 'success deve ser true');
    assert(putRes.body.data.preco === 749.90, 'Preço deve ter sido atualizado para 749.90');
    assert(putRes.body.data.modelo === 'Air Max 270 React', 'Modelo deve ter sido atualizado');
    assert(putRes.body.data.marca === 'Nike', 'Marca anterior deve permanecer intacta');

    // -------------------------------------------------------------
    // Teste 7: Validações de Criação (Campos Inválidos)
    // -------------------------------------------------------------
    console.log('\n--- TESTE 7: Validações de Entrada (Cenários Inválidos) ---');

    // 7.1 Sem marca
    const semMarca = await makeRequest('POST', '/api/tenis', {
      modelo: 'Ultraboost',
      preco: 699,
      foto: 'https://exemplo.com/foto.jpg',
    });
    assert(semMarca.status === 400, 'Sem marca deve retornar 400 Bad Request');
    assert(semMarca.body.success === false, 'success deve ser false');

    // 7.2 Sem modelo
    const semModelo = await makeRequest('POST', '/api/tenis', {
      marca: 'Adidas',
      preco: 699,
      foto: 'https://exemplo.com/foto.jpg',
    });
    assert(semModelo.status === 400, 'Sem modelo deve retornar 400 Bad Request');

    // 7.3 Preço negativo
    const precoNegativo = await makeRequest('POST', '/api/tenis', {
      marca: 'Puma',
      modelo: 'RS-X',
      preco: -100,
      foto: 'https://exemplo.com/foto.jpg',
    });
    assert(precoNegativo.status === 400, 'Preço negativo deve retornar 400 Bad Request');

    // 7.4 Preço com texto não numérico
    const precoTexto = await makeRequest('POST', '/api/tenis', {
      marca: 'Puma',
      modelo: 'RS-X',
      preco: 'cem-reais',
      foto: 'https://exemplo.com/foto.jpg',
    });
    assert(precoTexto.status === 400, 'Preço texto inválido deve retornar 400 Bad Request');

    // 7.5 Foto com URL inválida
    const fotoInvalida = await makeRequest('POST', '/api/tenis', {
      marca: 'Puma',
      modelo: 'RS-X',
      preco: 499.90,
      foto: 'foto-invalida-sem-protocolo',
    });
    assert(fotoInvalida.status === 400, 'URL inválida deve retornar 400 Bad Request');

    // 7.6 ID do MongoDB inválido (formato incorreto)
    const idInvalido = await makeRequest('GET', '/api/tenis/12345invalido');
    assert(idInvalido.status === 400, 'ID com formato inválido deve retornar 400 Bad Request');

    // 7.7 ID válido do MongoDB porém inexistente no banco
    const fakeValidId = new mongoose.Types.ObjectId().toString();
    const idNaoExiste = await makeRequest('GET', `/api/tenis/${fakeValidId}`);
    assert(idNaoExiste.status === 404, 'ID inexistente deve retornar 404 Not Found');

    // -------------------------------------------------------------
    // Teste 8: Exclusão (DELETE /api/tenis/:id)
    // -------------------------------------------------------------
    console.log('\n--- TESTE 8: DELETE /api/tenis/:id (Exclusão) ---');
    const deleteRes = await makeRequest('DELETE', `/api/tenis/${createdId}`);
    assert(deleteRes.status === 200, 'Exclusão deve retornar 200 OK');
    assert(deleteRes.body.success === true, 'success deve ser true');

    // Confirmar que o tênis realmente não existe mais
    const getDeletedRes = await makeRequest('GET', `/api/tenis/${createdId}`);
    assert(getDeletedRes.status === 404, 'Buscar tênis excluído deve retornar 404');

    // -------------------------------------------------------------
    // Teste 9: Rota Inexistente (404)
    // -------------------------------------------------------------
    console.log('\n--- TESTE 9: Rota Inexistente ---');
    const rota404 = await makeRequest('GET', '/api/rota-que-nao-existe');
    assert(rota404.status === 404, 'Rota inexistente deve retornar 404 Not Found');
    assert(rota404.body.success === false, 'success deve ser false');

    console.log('\n======================================================');
    console.log(`🎉 TODOS OS TESTES PASSARAM COM SUCESSO!`);
    console.log(`Total de asserções verificadas: ${passed}`);
    console.log(`Falhas: ${failed}`);
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ ERRO CRÍTICO NA EXECUÇÃO DOS TESTES:', err);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  }
}

runTests();
