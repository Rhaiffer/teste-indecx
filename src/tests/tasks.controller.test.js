const request = require('supertest');
const app = require('../index');
const Task = require('../models/task.model');
const User = require('../models/user.model');
const { updateTask } = require('../controllers/tasks.controller');
const { format } = require('date-fns');
const mongoose = require('mongoose');
process.env.TEST_MODE = 'true';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect('mongodb://localhost:27017/myapp', { useNewUrlParser: true, useUnifiedTopology: true });
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});
// Mock do middleware checkLogin
jest.mock('../middlewares/checkLogin.js', () => (req, res, next) => {
  req.userId = '123456789012345678901234'; // ID válido
  next();
});

describe('/api/v1/tasks', () => {
 afterEach(async () => {
    await User.deleteMany({});
  });

  it('should create a new task', async () => {
    // Crie um usuário de teste
    const user = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@example.com',
      password: 'testpasswo2!rd'
    });

    const response = await request(app)
      .post('/api/v1/tasks')
      .send({
        title: 'Task 1',
        description: 'Task description',
        user: user, // forneça o objeto user inteiro
      });
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Tarefa criada com sucesso!');
    expect(response.body.task).toBeDefined();

    // Clean up the created task
    await Task.deleteOne({ title: 'Task 1' });

    // Clean up the created user
    await User.deleteOne({ _id: user._id });
});

  it('should return an error if required parameters are missing', async () => {
    const response = await request(app)
      .post('/api/v1/tasks')
      .send({
        title: 'Task 2'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('O campo descrição é obrigatório!');
  });
  const mongoose = require('mongoose');
  it('should return an error if task with the same title already exists', async () => {
    // Create a task with the same title
    await Task.create({
    title: 'Task 3',
    description: 'Task description',
    status: 'Pendente',
    user: new mongoose.Types.ObjectId(), // cria um novo ObjectId
    createdAt: new Date() // cria uma nova data
  });

    const response = await request(app)
      .post('/api/v1/tasks')
      .send({
        title: 'Task 3',
        description: 'Task description',
        status: 'Pendente'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Tarefa já cadastrada!');

    // Clean up the created task
    await Task.deleteOne({ title: 'Task 3' });
  });

  it('should return an error if an unexpected error occurs', async () => {
    // Mock an error by passing an invalid value for the status field
    const response = await request(app)
      .post('/api/v1/tasks')
      .send({
        title: 'Task 4',
        description: 'Task description',
        status: 'InvalidStatus'
      });

    expect(response.status).toBe(500);
    expect(response.body.message).toBeDefined();
  });
});
afterAll(() => {
  delete process.env.TEST_MODE;
});


/////////////////////////////////////////////// Testes de updateTask////////////////////////////////////////////////

describe('updateTask', () => {
  afterEach(async () => {
    await Task.deleteMany({});
  });

  it('should update a task', async () => {
    const taskId = new mongoose.Types.ObjectId();
    const req = {
      params: { id: taskId },
      body: {
        title: 'Task 1',
        description: 'Description 1',
        status: 'Em Andamento'
      },
      userId: '123'
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

     const findOneMock = jest.spyOn(Task, 'findOne').mockImplementation((query) => {
      return Promise.resolve({ _id: taskId, user: '123' });
    });

    const findOneAndUpdateMock = jest.spyOn(Task, 'findOneAndUpdate').mockImplementation((id, data, options) => {
      return Promise.resolve({
        _id: id,
        ...data,
        user: '123'
      });
    });

    await updateTask(req, res);

    expect(findOneMock).toHaveBeenCalledWith({ _id: taskId, user: '123' });
   expect(findOneAndUpdateMock.mock.calls[0][0]._id).toEqual(taskId);
expect(findOneAndUpdateMock.mock.calls[0][1]).toEqual({
  title: req.body.title,
  description: req.body.description,
  status: req.body.status,
  updatedAt: format(new Date(), 'dd/MM/yyyy HH:mm:ss')
});
expect(findOneAndUpdateMock.mock.calls[0][2]).toEqual({ new: true });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Tarefa atualizada com sucesso!', task: expect.any(Object) });

    findOneMock.mockRestore();
    findOneAndUpdateMock.mockRestore();
  });

  it('should return 400 if the task ID is invalid', async () => {
    const req = {
      params: { id: 'invalid_id' },
      body: {
        title: 'Task 1',
        description: 'Description 1',
        status: 'Pendente'
      },
      userId: '123'
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await updateTask(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'ID de tarefa inválido!' });
  });

  it('should return 404 if the task is not found', async () => {
    const taskId = new mongoose.Types.ObjectId();
    const req = {
      params: { id: taskId },
      body: {
        title: 'Task 1',
        description: 'Description 1',
        status: 'In Progress'
      },
      userId: '123'
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const findOneMock = jest.spyOn(Task, 'findOne').mockResolvedValueOnce(null);

    await updateTask(req, res);

    expect(findOneMock).toHaveBeenCalledWith({ _id: taskId, user: '123' });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Tarefa não encontrada!' });

    findOneMock.mockRestore();
  });

  it('should return 400 if a task with the same title already exists', async () => {
  const taskId = new mongoose.Types.ObjectId();
  const req = {
    params: { id: taskId },
    body: {
      title: 'Task 1',
      description: 'Description 1',
      status: 'In Progress'
    },
    userId: '123'
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };

  const findOneMock = jest.spyOn(Task, 'findOne');
findOneMock
  .mockImplementationOnce(() => Promise.resolve({ _id: new mongoose.Types.ObjectId(), user: '123' })) // retorna um objeto na primeira chamada
  .mockImplementationOnce(() => Promise.resolve({ _id: new mongoose.Types.ObjectId() })); // retorna um objeto na segunda chamada

   await updateTask(req, res);

  expect(findOneMock.mock.calls[0][0]).toEqual({ _id: taskId, user: '123' });
  expect(findOneMock.mock.calls[1][0]).toEqual({ title: req.body.title, user: '123' });
  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({ message: 'Já existe uma tarefa com este título!' });

  findOneMock.mockRestore();
});

  it('should return 500 if an error occurs', async () => {
    const taskId = new mongoose.Types.ObjectId();
    const req = {
      params: { id: taskId },
      body: {
        title: 'Task 1',
        description: 'Description 1',
        status: 'In Progress'
      },
      userId: '123'
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const findOneMock = jest.spyOn(Task, 'findOne').mockRejectedValueOnce(new Error());

    await updateTask(req, res);

    expect(findOneMock).toHaveBeenCalledWith({ _id: taskId, user: '123' });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });

    findOneMock.mockRestore();
  });
});