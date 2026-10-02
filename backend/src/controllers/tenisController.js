const mongoose = require('mongoose');
const Tenis = require('../models/Tenis');
const connectDB = require('../config/database');

/**
 * Garante que a conexão com o MongoDB esteja ativa antes de cada operação
 */
async function ensureDbConnection() {
  await connectDB();
}

/**
 * Listar todos os tênis
 * GET /api/tenis
 */
exports.getAllTenis = async (req, res, next) => {
  try {
    await ensureDbConnection();
    const lista = await Tenis.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: lista,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Buscar um tênis específico por ID
 * GET /api/tenis/:id
 */
exports.getTenisById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido fornecido.',
      });
    }

    await ensureDbConnection();
    const item = await Tenis.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Tênis não encontrado.',
      });
    }

    return res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cadastrar um novo tênis
 * POST /api/tenis
 */
exports.createTenis = async (req, res, next) => {
  try {
    const { marca, modelo, preco, foto } = req.body;

    // Validações prévias explícitas
    if (!marca || typeof marca !== 'string' || !marca.trim()) {
      return res.status(400).json({
        success: false,
        error: 'A marca é obrigatória.',
      });
    }

    if (!modelo || typeof modelo !== 'string' || !modelo.trim()) {
      return res.status(400).json({
        success: false,
        error: 'O modelo é obrigatório.',
      });
    }

    if (preco === undefined || preco === null || preco === '') {
      return res.status(400).json({
        success: false,
        error: 'O preço é obrigatório.',
      });
    }

    const precoNum = Number(preco);
    if (isNaN(precoNum) || precoNum <= 0) {
      return res.status(400).json({
        success: false,
        error: 'O preço deve ser um número maior que zero.',
      });
    }

    if (!foto || typeof foto !== 'string' || !foto.trim()) {
      return res.status(400).json({
        success: false,
        error: 'A URL da foto é obrigatória.',
      });
    }

    try {
      const parsed = new URL(foto.trim());
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return res.status(400).json({
          success: false,
          error: 'A foto deve ter uma URL válida com protocolo http:// ou https://.',
        });
      }
    } catch {
      return res.status(400).json({
        success: false,
        error: 'A foto deve ter uma URL válida com protocolo http:// ou https://.',
      });
    }

    await ensureDbConnection();
    const novoTenis = await Tenis.create({
      marca: marca.trim(),
      modelo: modelo.trim(),
      preco: precoNum,
      foto: foto.trim(),
    });

    return res.status(201).json({
      success: true,
      data: novoTenis,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(' '),
      });
    }
    next(error);
  }
};

/**
 * Atualizar um tênis existente por ID
 * PUT /api/tenis/:id
 */
exports.updateTenis = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido fornecido.',
      });
    }

    const { marca, modelo, preco, foto } = req.body;
    const updates = {};

    if (marca !== undefined) {
      if (typeof marca !== 'string' || !marca.trim()) {
        return res.status(400).json({
          success: false,
          error: 'A marca não pode ser vazia.',
        });
      }
      updates.marca = marca.trim();
    }

    if (modelo !== undefined) {
      if (typeof modelo !== 'string' || !modelo.trim()) {
        return res.status(400).json({
          success: false,
          error: 'O modelo não pode ser vazio.',
        });
      }
      updates.modelo = modelo.trim();
    }

    if (preco !== undefined) {
      const precoNum = Number(preco);
      if (isNaN(precoNum) || precoNum <= 0) {
        return res.status(400).json({
          success: false,
          error: 'O preço deve ser um número maior que zero.',
        });
      }
      updates.preco = precoNum;
    }

    if (foto !== undefined) {
      if (typeof foto !== 'string' || !foto.trim()) {
        return res.status(400).json({
          success: false,
          error: 'A foto não pode ser vazia.',
        });
      }
      try {
        const parsed = new URL(foto.trim());
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          return res.status(400).json({
            success: false,
            error: 'A foto deve ter uma URL válida com protocolo http:// ou https://.',
          });
        }
      } catch {
        return res.status(400).json({
          success: false,
          error: 'A foto deve ter uma URL válida com protocolo http:// ou https://.',
        });
      }
      updates.foto = foto.trim();
    }

    await ensureDbConnection();
    const tenisAtualizado = await Tenis.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!tenisAtualizado) {
      return res.status(404).json({
        success: false,
        error: 'Tênis não encontrado.',
      });
    }

    return res.status(200).json({
      success: true,
      data: tenisAtualizado,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(' '),
      });
    }
    next(error);
  }
};

/**
 * Excluir um tênis por ID
 * DELETE /api/tenis/:id
 */
exports.deleteTenis = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido fornecido.',
      });
    }

    await ensureDbConnection();
    const tenisRemovido = await Tenis.findByIdAndDelete(id);

    if (!tenisRemovido) {
      return res.status(404).json({
        success: false,
        error: 'Tênis não encontrado.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        message: 'Tênis removido com sucesso.',
        id: tenisRemovido._id,
      },
    });
  } catch (error) {
    next(error);
  }
};
