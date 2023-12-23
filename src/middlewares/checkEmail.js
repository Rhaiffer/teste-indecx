const validator = require('validator');
const User = require('../models/user.model'); // Importe o modelo User

const checkEmail = async (req, res, next) => {
  const { email } = req.body;

  // Verificar se o e-mail está presente
  if (!email) {
    return res.status(400).json({ message: 'O campo email é obrigatório!' });
  }

  // Verificar se o e-mail é válido
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'E-mail inválido!' });
  }

  // Verificar se o e-mail já está registrado
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'Email já cadastrado!' });
  }

  // Se o e-mail for válido e não estiver registrado, prosseguir para o próximo middleware
  next();
};

module.exports = checkEmail;