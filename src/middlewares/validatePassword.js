const passwordValidation = (req, res, next) => {
  const { password } = req.body;
  const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;

  if (!passwordRegex.test(password)) {
    return res.status(400).json({ message: 'A senha deve conter no mínimo 8 caracteres, 1 número, 1 letra maiúscula e 1 símbolo.' });
  }

  if (!password) {
    return res.status(400).json({ message: 'O campo "password" é obrigatório!' });
  }

  next();
};

module.exports = passwordValidation;