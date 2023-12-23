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

  it('deve criar uma nova tarefa', async () => {
    // Primeiro, cria um usuário de teste
    const user = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@example.com',
      password: 'testpasswo2!rd'
    });
    
    // Envia um objeto de tarefa no corpo da requisição
    const response = await request(app)
      .post('/api/v1/tasks')
      .send({
        title: 'Task 1',
        description: 'Task description',
        user: user, // fornece o objeto user inteiro
      });

    // Verifica se a resposta tem o status 201 (criado)
    expect(response.status).toBe(201);
    // Verifica se a mensagem na resposta é a esperada
    expect(response.body.message).toBe('Tarefa criada com sucesso!');
    // Verifica se a tarefa foi realmente criada
    expect(response.body.task).toBeDefined();

    // Limpa a tarefa criada para o teste
    await Task.deleteOne({ title: 'Task 1' });

    // Limpa o usuário criado para o teste
    await User.deleteOne({ _id: user._id });
});

  it('deve retornar um erro se os parâmetros necessários estiverem faltando', async () => {
    // Envia um objeto de tarefa com o campo "description" faltando
    const response = await request(app)
      .post('/api/v1/tasks')
      .send({
        title: 'Task 2' // campo "description" faltando
      });

    // Verifica se a resposta tem o status 400 (solicitação inválida)
    expect(response.status).toBe(400);
    // Verifica se a mensagem na resposta é a esperada
    expect(response.body.message).toBe('O campo descrição é obrigatório!');
});

  it('deve retornar um erro se já existir uma tarefa com o mesmo título', async () => {
    // Primeiro, cria uma tarefa com o título 'Task 3'
    await Task.create({
    title: 'Task 3',
    description: 'Task description',
    status: 'Pendente',
    user: new mongoose.Types.ObjectId(), // cria um novo ObjectId para o usuário
    createdAt: new Date() // define a data de criação como a data atual
  });

    // Em seguida, tenta criar outra tarefa com o mesmo título
    const response = await request(app)
      .post('/api/v1/tasks')
      .send({
        title: 'Task 3',
        description: 'Task description',
        status: 'Pendente'
      });

    // Verifica se a resposta tem o status 400 (solicitação inválida)
    expect(response.status).toBe(400);
    // Verifica se a mensagem na resposta é a esperada
    expect(response.body.message).toBe('Tarefa já cadastrada!');

    // Limpa a tarefa criada para o teste
    await Task.deleteOne({ title: 'Task 3' });
});

  it('deve retornar um erro se ocorrer um erro inesperado', async () => {
    // Simula um erro passando um valor inválido para o campo status
    const response = await request(app)
      .post('/api/v1/tasks')
      .send({
        title: 'Task 4',
        description: 'Task description',
        status: 'InvalidStatus' // status inválido
      });

    // Verifica se a resposta tem o status 500 (erro interno do servidor)
    expect(response.status).toBe(500);
    // Verifica se a mensagem de erro está definida na resposta
    expect(response.body.message).toBeDefined();
  });
});
// Após todos os testes, limpa a variável de ambiente TEST_MODE
afterAll(() => {
  delete process.env.TEST_MODE;
});;


/////////////////////////////////////////////// Testes de updateTask////////////////////////////////////////////////

describe('updateTask', () => {
  // Após cada teste, limpa todas as tarefas criadas
afterEach(async () => {
    await Task.deleteMany({});
});

// Este teste verifica se a função de atualização de tarefas está funcionando corretamente
it('deve atualizar uma tarefa', async () => {
    // Define um ID de tarefa e um objeto de requisição
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

    // Cria um objeto de resposta mock
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Cria um mock para a função findOne do modelo Task
    const findOneMock = jest.spyOn(Task, 'findOne').mockImplementation((query) => {
      return Promise.resolve({ _id: taskId, user: '123' });
    });

    // Cria um mock para a função findOneAndUpdate do modelo Task
    const findOneAndUpdateMock = jest.spyOn(Task, 'findOneAndUpdate').mockImplementation((id, data, options) => {
      return Promise.resolve({
        _id: id,
        ...data,
        user: '123'
      });
    });

    // Chama a função de atualização de tarefas
    await updateTask(req, res);

    // Verifica se os mocks foram chamados com os argumentos corretos
    expect(findOneMock).toHaveBeenCalledWith({ _id: taskId, user: '123' });
    expect(findOneAndUpdateMock.mock.calls[0][0]._id).toEqual(taskId);
    expect(findOneAndUpdateMock.mock.calls[0][1]).toEqual({
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
      updatedAt: format(new Date(), 'dd/MM/yyyy HH:mm:ss')
    });
    expect(findOneAndUpdateMock.mock.calls[0][2]).toEqual({ new: true });

    // Verifica se a resposta tem o status 200 (OK) e a mensagem correta
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Tarefa atualizada com sucesso!', task: expect.any(Object) });

    // Restaura os mocks para evitar efeitos colaterais
    findOneMock.mockRestore();
    findOneAndUpdateMock.mockRestore();
});

  it('deve retornar 400 se o ID da tarefa for inválido', async () => {
    // Define um objeto de requisição com um ID de tarefa inválido
    const req = {
      params: { id: 'invalid_id' }, // ID de tarefa inválido
      body: {
        title: 'Task 1',
        description: 'Description 1',
        status: 'Pendente'
      },
      userId: '123'
    };

    // Cria um objeto de resposta mock
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Chama a função de atualização de tarefas
    await updateTask(req, res);

    // Verifica se a resposta tem o status 400 (solicitação inválida) e a mensagem correta
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'ID de tarefa inválido!' });
});

  it('deve retornar 404 se a tarefa não for encontrada', async () => {
    // Define um ID de tarefa e um objeto de requisição
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

    // Cria um objeto de resposta mock
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Cria um mock para a função findOne do modelo Task que retorna null
    const findOneMock = jest.spyOn(Task, 'findOne').mockResolvedValueOnce(null);

    // Chama a função de atualização de tarefas
    await updateTask(req, res);

    // Verifica se o mock foi chamado com os argumentos corretos
    expect(findOneMock).toHaveBeenCalledWith({ _id: taskId, user: '123' });

    // Verifica se a resposta tem o status 404 (não encontrado) e a mensagem correta
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Tarefa não encontrada!' });

    // Restaura o mock para evitar efeitos colaterais
    findOneMock.mockRestore();
});

  it('deve retornar 400 se já existir uma tarefa com o mesmo título', async () => {
    // Define um ID de tarefa e um objeto de requisição
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

    // Cria um objeto de resposta mock
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Cria um mock para a função findOne do modelo Task
    const findOneMock = jest.spyOn(Task, 'findOne');
    findOneMock
      .mockImplementationOnce(() => Promise.resolve({ _id: new mongoose.Types.ObjectId(), user: '123' })) // retorna um objeto na primeira chamada
      .mockImplementationOnce(() => Promise.resolve({ _id: new mongoose.Types.ObjectId() })); // retorna um objeto na segunda chamada

    // Chama a função de atualização de tarefas
    await updateTask(req, res);

    // Verifica se o mock foi chamado com os argumentos corretos
    expect(findOneMock.mock.calls[0][0]).toEqual({ _id: taskId, user: '123' });
    expect(findOneMock.mock.calls[1][0]).toEqual({ title: req.body.title, user: '123' });

    // Verifica se a resposta tem o status 400 (solicitação inválida) e a mensagem correta
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Já existe uma tarefa com este título!' });

    // Restaura o mock para evitar efeitos colaterais
    findOneMock.mockRestore();
});

 it('deve retornar 500 se ocorrer um erro', async () => {
    // Define um ID de tarefa e um objeto de requisição
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

    // Cria um objeto de resposta mock
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Cria um mock para a função findOne do modelo Task que rejeita com um erro
    const findOneMock = jest.spyOn(Task, 'findOne').mockRejectedValueOnce(new Error());

    // Chama a função de atualização de tarefas
    await updateTask(req, res);

    // Verifica se o mock foi chamado com os argumentos corretos
    expect(findOneMock).toHaveBeenCalledWith({ _id: taskId, user: '123' });

    // Verifica se a resposta tem o status 500 (erro interno do servidor) e uma mensagem de erro
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });

    // Restaura o mock para evitar efeitos colaterais
    findOneMock.mockRestore();
});
});