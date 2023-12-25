const Task = require('../models/task.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');
const { format } = require('date-fns');

const createTask = async (req, res) => {
  const { title, description, status } = req.body;
  const { userId } = req;
  const user = await User.findById(userId);

  const requiredParams = [
    { param: 'title', message: 'O campo título é obrigatório!' },
    { param: 'description', message: 'O campo descrição é obrigatório!' },
  ];

  const missingParam = requiredParams.find((param) => !req.body[param.param]);

  if (missingParam) {
    return res.status(400).json({ message: missingParam.message });
  }
  try {
    const resultTask = await Task.findOne({ title: title });
    if (resultTask) {
      return res.status(400).json({ message: 'Tarefa já cadastrada!' });
    }
    const task = await new Task({
      title,
      description,
      status,
      user: userId,
      createdAt: format(new Date(), 'dd/MM/yyyy'),
    });
    await task.save();
    return res
      .status(201)
      .json({ message: 'Tarefa criada com sucesso!', task });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAllTasks = async (req, res) => {
  const { userId } = req;
  try {
    const tasks = await Task.find({ user: userId });
    return res.status(200).json({ tasks });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getTaskById = async (req, res) => {
  const { id } = req.params;
  const { userId } = req;
  try {
    const result = await Task.findOne({ _id: id, user: userId });
    if (!result) {
      return res.status(404).json({ message: 'Tarefa não encontrada!' });
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getTasksByStatusOrDate = async (req, res) => {
  const { status, date } = req.query;
  const { userId } = req;
  let query = { user: userId };

  if (status) {
    query.status = status;
  }

  if (date) {
    query.createdAt = date;
  }

  try {
    const tasks = await Task.find(query);
    if (tasks.length === 0) {
      return res
        .status(404)
        .json({
          message:
            'Nenhuma tarefa encontrada com os critérios de busca fornecidos.',
        });
    }
    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;
  const { userId } = req;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID de tarefa inválido!' });
  }

  try {
    const result = await Task.findOne({ _id: id, user: userId });
    if (!result) {
      return res.status(404).json({ message: 'Tarefa não encontrada!' });
    }

    const taskWithSameTitle = await Task.findOne({ title, user: userId });
    if (taskWithSameTitle && String(taskWithSameTitle._id) != id) {
      return res
        .status(400)
        .json({ message: 'Já existe uma tarefa com este título!' });
    }

    const task = await Task.findByIdAndUpdate(
      id,
      {
        title,
        description,
        status,
        updatedAt: format(new Date(), 'dd/MM/yyyy HH:mm:ss'),
      },
      { new: true },
    );
    return res
      .status(200)
      .json({ message: 'Tarefa atualizada com sucesso!', task });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  const { id } = req.params;
  const { userId } = req;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID de tarefa inválido!' });
  }

  try {
    const result = await Task.findOne({ _id: id, user: userId });
    if (!result) {
      return res.status(404).json({ message: 'Tarefa não encontrada!' });
    }
    await Task.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Tarefa excluída com sucesso!' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTasksByStatusOrDate,
};
