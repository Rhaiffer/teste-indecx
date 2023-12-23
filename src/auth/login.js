const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const secret = process.env.JWT_SECRET;

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const requiedParams = [
    { param: 'email', message: 'O campo email é obrigatório!' },
    { param: 'password', message: 'O campo senha é obrigatório!' }
  ];

  const missingParam = requiedParams.find(param => !req.body[param.param]);

  if (missingParam) {
    return res.status(400).json({
      message: missingParam.message
    });
  }

  const emailTrim = email.trim();

  try {

    const result = await User.findOne({ email: emailTrim });

    if (!result) {
      return res.status(400).json({ message: 'Usuário não encontrado!' });
    }


    const isPasswordValid = bcrypt.compareSync(password, result.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Senha inválida!' });
    }

    const token = jwt.sign({ 
      id: result._id ,
      firstName: result.firstName,
      lastName: result.lastName,
    }, secret, 
    { expiresIn: '1d' }
    );

    return res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao buscar usuário!' });
  } 
}


module.exports = loginUser;
