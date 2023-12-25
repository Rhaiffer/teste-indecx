const bcrypt = require('bcrypt');
const User = require('../models/user.model');

const registerUser = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const requiedParams = [
    { param: 'firstName', message: 'O campo nome é obrigatório!' },
    { param: 'lastName', message: 'O campo sobrenome é obrigatório!' },
    { param: 'email', message: 'O campo email é obrigatório!' },
    { param: 'password', message: 'O campo senha é obrigatório!' },
  ];

  const missingParam = requiedParams.find((param) => !req.body[param.param]);

  if (missingParam) {
    return res.status(400).json({
      message: missingParam.message,
    });
  }

  const emailTrim = email.trim();
  try {
    const resultEmail = await User.findOne({ email: emailTrim });

    if (resultEmail) {
      return res.status(400).json({ message: 'Email já cadastrado!' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const user = new User({
      firstName: firstName,
      lastName: lastName,
      email: emailTrim,
      password: hash,
    });
    await user.save();
    return res
      .status(201)
      .json({ message: 'Usuário criado com sucesso!', user });
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') {
      console.error(err);
    }
    return res.status(500).json({ message: 'Erro ao criar usuário!' });
  }
};

const getAllUsers = async (req, res) => {
  const { userId } = req; // supondo que o id do usuário autenticado esteja disponível em req.user.id

  try {
    const result = await User.findById(userId);
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao buscar usuário!' });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  const { userId } = req; // supondo que o id do usuário autenticado esteja disponível em req.user.id

  if (id !== userId) {
    return res
      .status(403)
      .json({
        message: 'Você não tem permissão para visualizar essas informações.',
      });
  }

  try {
    const result = await User.findById(id);
    if (!result) {
      return res.status(404).json({ message: 'Usuário não encontrado!' });
    }
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao buscar usuário!' });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { userId } = req;
  const { firstName, lastName, email, password } = req.body;

  if (id !== userId) {
    return res
      .status(403)
      .json({
        message: 'Você não tem permissão para atualizar essas informações.',
      });
  }

  try {
    const result = await User.findById(id);
    if (!result) {
      return res.status(404).json({ message: 'Usuário não encontrado!' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const user = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hash,
    };

    const resultUpdate = await User.findByIdAndUpdate(id, user);
    if (!resultUpdate) {
      return res.status(400).json({ message: 'Erro ao atualizar usuário!' });
    }

    return res.status(200).json({ message: 'Usuário atualizado com sucesso!' });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao atualizar usuário!' });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  const { userId } = req;

  if (id !== userId) {
    return res
      .status(403)
      .json({
        message: 'Você não tem permissão para deletar essas informações.',
      });
  }

  try {
    const result = await User.findById(id);
    if (!result) {
      return res.status(404).json({ message: 'Usuário não encontrado!' });
    }

    const resultDelete = await User.findByIdAndDelete(id);
    if (!resultDelete) {
      return res.status(400).json({ message: 'Erro ao deletar usuário!' });
    }

    return res.status(200).json({ message: 'Usuário deletado com sucesso!' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao deletar usuário!' });
  }
};

module.exports = {
  registerUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
