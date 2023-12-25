const express = require('express');
const login = require('./auth/login');
const routes = express();
const checkLogin = require('./middlewares/checkLogin');
const checkEmail = require('./middlewares/checkEmail');
const validateTask = require('./middlewares/validateTask');
const passwordValidation = require('./middlewares/validatePassword');
// controller Usuarios
const {
  registerUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('./controllers/users.controller');
// controller Tarefas

const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTasksByStatusOrDate,
} = require('./controllers/tasks.controller');

// rota de login
routes.post('/api/auth/login', login);
// rota de usuário
routes.post('/api/v1/users', checkEmail, passwordValidation, registerUser);
routes.get('/api/v1/users', checkLogin, getAllUsers);
routes.get('/api/v1/users/:id', checkLogin, getUserById);
routes.put(
  '/api/v1/users/:id',
  checkLogin,
  checkEmail,
  passwordValidation,
  updateUser,
);
routes.delete('/api/v1/users/:id', checkLogin, deleteUser);

// controller Tarefas
routes.post('/api/v1/tasks', checkLogin, createTask);
routes.get('/api/v1/tasks', checkLogin, getAllTasks);
routes.get('/api/v1/tasks/search', checkLogin, getTasksByStatusOrDate);
routes.get('/api/v1/tasks/:id', checkLogin, getTaskById);
routes.put('/api/v1/tasks/:id', checkLogin, validateTask, updateTask);
routes.delete('/api/v1/tasks/:id', checkLogin, deleteTask);

module.exports = routes;
