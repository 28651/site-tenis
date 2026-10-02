const mongoose = require('mongoose');

/**
 * Cache global da conexão Mongoose para evitar múltiplas conexões
 * desnecessárias em ambientes serverless (Vercel).
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

let memoryServerInstance = null;

/**
 * Conecta ao MongoDB reutilizando conexões em instâncias ativas
 * @param {string} [customUri] URI opcional para testes ou conexões personalizadas
 * @returns {Promise<typeof mongoose>}
 */
async function connectDB(customUri) {
  let uri = customUri || process.env.MONGODB_URI;

  if (!uri) {
    // Se não estiver em produção, inicializa banco em memória para conveniência no teste local imediato
    if (process.env.NODE_ENV !== 'production') {
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        if (!memoryServerInstance) {
          memoryServerInstance = await MongoMemoryServer.create();
          console.log('💡 MONGODB_URI não configurada. MongoDB em memória inicializado para desenvolvimento.');
        }
        uri = memoryServerInstance.getUri();
      } catch (err) {
        throw new Error('A variável de ambiente MONGODB_URI não foi definida no arquivo .env ou no painel da Vercel.');
      }
    } else {
      throw new Error('A variável de ambiente MONGODB_URI não foi definida no arquivo .env ou no painel da Vercel.');
    }
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log('✅ Conexão com o MongoDB estabelecida com sucesso.');
      return mongooseInstance;
    }).catch((err) => {
      cached.promise = null;
      console.error('❌ Erro ao conectar ao MongoDB:', err.message);
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
