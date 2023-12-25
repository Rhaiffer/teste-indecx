const mongoose = require('mongoose');

// Definindo o esquema para a coleção 'users'
const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timesTamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
);

// Criando o modelo
const User = mongoose.model('User', UserSchema);

module.exports = User;
