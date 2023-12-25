const validStatuses = ['Em Andamento', 'Pendente', 'Concluído'];

const validateTask = (req, res, next) => {
  const { status } = req.body;

  if (!validStatuses.includes(status)) {
    return res
      .status(400)
      .json({
        message:
          'Status inválido. Os status válidos são: Em Andamento, Pendente, Concluído.',
      });
  }

  // Adicione aqui mais validações conforme necessário

  next();
};

module.exports = validateTask;
