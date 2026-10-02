const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const tenisRoutes = require('./routes/tenisRoutes');

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Endpoint de Health Check
app.get('/api/health', (req, res) => {
  return res.status(200).json({
    status: 'ok',
    message: 'API funcionando',
  });
});

// Rotas de Tênis
app.use('/api/tenis', tenisRoutes);

// Servir arquivos estáticos do frontend (root, public e frontend)
const rootPath = path.resolve(__dirname, '../../');
const publicPath = path.resolve(__dirname, '../../public');
const frontendPath = path.resolve(__dirname, '../../frontend');

app.use(express.static(rootPath));
app.use(express.static(publicPath));
app.use(express.static(frontendPath));

// Rota 404 para endpoints de API não encontrados
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
  });
});

// Fallback SPA para carregar frontend caso a rota não seja da API
app.use((req, res) => {
  let file = path.join(rootPath, 'index.html');
  if (!fs.existsSync(file)) {
    file = fs.existsSync(path.join(publicPath, 'index.html'))
      ? path.join(publicPath, 'index.html')
      : path.join(frontendPath, 'index.html');
  }
  res.sendFile(file);
});

// Middleware centralizado de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro na requisição:', err);

  // Tratamento específico de erro de sintaxe JSON no body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Formato JSON inválido no corpo da requisição.',
    });
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor.';

  return res.status(statusCode).json({
    success: false,
    error: message,
  });
});

// Inicialização local quando executado diretamente
const PORT = process.env.PORT || 3000;

if (require.main === module) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${PORT} -> http://localhost:${PORT}/api/health`);
      });
    })
    .catch((err) => {
      console.error('Falha ao iniciar servidor devido a erro no banco de dados:', err.message);
      // Ainda iniciamos o app para que endpoints como /api/health funcionem
      app.listen(PORT, () => {
        console.log(`⚠️ Servidor rodando na porta ${PORT} (Aviso: MongoDB desconectado)`);
      });
    });
}

module.exports = app;
