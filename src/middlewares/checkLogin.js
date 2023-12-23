const jwt = require('jsonwebtoken');
require('dotenv').config();

const segredo = process.env.JWT_SECRET;
const User = require('../models/user.model');

const checkLogin = async (req, res, next) => {
   if (process.env.TEST_MODE) {
    return next();
  }
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Token não informado!' });

  const parts = authHeader.split(' ');
  if (!parts.length === 2) return res.status(400).json({ message: 'Token deve ser composto por duas partes: \'Bearer\' e o valor do token.' });

  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) return res.status(400).json({ message: 'Formato do token inválido! O formato correto é: Bearer [token].' });

  jwt.verify(token, segredo, async (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Token inválido ou expirado!' });

    const { id } = decoded;
    const result = await User.findById(id);
    if (!result) return res.status(401).json({ message: 'Token inválido! Usuário não encontrado.' });

    req.userId = id;
    return next();
  });
};

module.exports = checkLogin;