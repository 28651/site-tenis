const mongoose = require('mongoose');

const urlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|webp|avif|gif|svg)(\?.*)?$/i;

const TenisSchema = new mongoose.Schema(
  {
    marca: {
      type: String,
      required: [true, 'A marca do tênis é obrigatória.'],
      trim: true,
      minlength: [2, 'A marca deve ter pelo menos 2 caracteres.'],
      maxlength: [50, 'A marca não pode exceder 50 caracteres.'],
    },
    modelo: {
      type: String,
      required: [true, 'O modelo do tênis é obrigatório.'],
      trim: true,
      minlength: [2, 'O modelo deve ter pelo menos 2 caracteres.'],
      maxlength: [80, 'O modelo não pode exceder 80 caracteres.'],
    },
    preco: {
      type: Number,
      required: [true, 'O preço do tênis é obrigatório.'],
      min: [0.01, 'O preço deve ser maior que zero.'],
      validate: {
        validator: function (v) {
          return typeof v === 'number' && !isNaN(v) && isFinite(v);
        },
        message: 'O preço deve ser um número válido.',
      },
    },
    foto: {
      type: String,
      required: [true, 'A URL da foto do tênis é obrigatória.'],
      trim: true,
      validate: {
        validator: function (v) {
          if (!v || typeof v !== 'string') return false;
          // Aceita URLs http/https válidas
          try {
            const parsed = new URL(v);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:';
          } catch {
            return false;
          }
        },
        message: 'A foto deve ser uma URL válida iniciando com http:// ou https://.',
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.models.Tenis || mongoose.model('Tenis', TenisSchema);
