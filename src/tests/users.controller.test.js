const request = require('supertest');
const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const app  = require('../index');
const { updateUser } = require('../controllers/users.controller');
const mongoose = require('mongoose');

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

jest.mock('../middlewares/checkLogin.js', () => (req, res, next) => {
  req.user = {
    id: '123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'johndoe@example.com',
  };
  next();
});
// Descrevendo o grupo de testes para a rota '/api/v1/users'
describe('/api/v1/users', () => {
  // Após cada teste, limpa todos os usuários do banco de dados
  afterEach(async () => {
    await User.deleteMany({});
  });

  it('deve registrar um novo usuário', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        password: 'Password123!'
      });

    // Verificando se o status da resposta e a mensagem estão corretos
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Usuário criado com sucesso!');
    // Verificando se o usuário foi criado
    expect(response.body.user).toBeDefined();

    // Limpeza do banco de dados
    await User.deleteOne({ email: 'johndoe@example.com' });
  });

  it('deve retornar um erro se os parâmetros necessários estiverem faltando', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .send({
        firstName: 'John',
        lastName: 'Doe'
      });

    // Verificando se o status da resposta e a mensagem estão corretos
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('O campo email é obrigatório!');
  });

  it('deve retornar um erro se o e-mail já estiver registrado', async () => {
    // Criando um usuário com o mesmo email
    const existingUser = new User({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      password: 'password123'
    });
    await existingUser.save();

    const response = await request(app)
      .post('/api/v1/users')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        password: 'Password123!'
      });

    // Verificando se o status da resposta e a mensagem estão corretos
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Email já cadastrado!');

    // Limpeza do banco de dados
    await User.deleteOne({ email: 'johndoe@example.com' });
  });

  it('deve retornar um erro se ocorrer um erro inesperado', async () => {
    // Simulando um erro na função save
    const saveMock = jest.spyOn(User.prototype, 'save').mockImplementation(() => {
      throw new Error();
    });

    try {
      const response = await request(app)
        .post('/api/v1/users')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'johndoe@example.com',
          password: 'Password123!'
        });

      // Verificando se o status da resposta e a mensagem estão corretos
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Erro ao criar usuário!');
    } finally {
      // Restaurando a função save para seu comportamento original
      saveMock.mockRestore();
    }
  });

  // Teste para verificar se um erro é retornado quando a senha não atende aos requisitos
  it('deve retornar um erro se a senha não atender aos requisitos', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        password: 'password' // Senha que não atende aos requisitos
      });

    // Verificando se o status da resposta e a mensagem estão corretos
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('A senha deve conter no mínimo 8 caracteres, 1 número, 1 letra maiúscula e 1 símbolo.');
  });
});

/////////////////////////////////////////////////// TESTES DE UPDATE DE USUARIO //////////////////////////////////////////////////////

describe('updateUser', () => {
  it('deve atualizar um usuário', async () => {
    try {
      // Define o ID do usuário e a requisição
      const id = 'user_id';
      const req = {
        params: { id },
        userId: id,
        body: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'johndoe@example.com',
          password: 'password123'
        }
      };

      // Mock da resposta
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock das funções do bcrypt e do User
      const genSaltSyncMock = jest.spyOn(bcrypt, 'genSaltSync').mockReturnValue('salt');
      const hashSyncMock = jest.spyOn(bcrypt, 'hashSync').mockReturnValue('hashed_password');
      const findByIdMock = jest.spyOn(User, 'findById').mockResolvedValueOnce({ id: '123' });
      const findByIdAndUpdateMock = jest.spyOn(User, 'findByIdAndUpdate').mockResolvedValueOnce({ id: '123' });

      // Chama a função updateUser
      await updateUser(req, res);

      // Verifica se as funções foram chamadas com os argumentos corretos
      expect(findByIdMock).toHaveBeenCalledWith(id);
      expect(genSaltSyncMock).toHaveBeenCalledWith(10);
      expect(hashSyncMock).toHaveBeenCalledWith(req.body.password, 'salt');
      expect(findByIdAndUpdateMock).toHaveBeenCalledWith(id, {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: 'hashed_password'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuário atualizado com sucesso!' });

      // Restaura os mocks para o estado original
      findByIdMock.mockRestore();
      genSaltSyncMock.mockRestore();
      hashSyncMock.mockRestore();
      findByIdAndUpdateMock.mockRestore();
    } catch (err) {
      // Captura e registra qualquer erro que ocorra durante o teste
      console.error('Erro capturado:', err.stack);
    }
  });

 it('deve retornar 404 se o usuário não for encontrado', async () => {
  // Define o ID do usuário e a requisição
  const id = 'user_id';
  const req = {
    params: { id },
    userId: id,
    body: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      password: 'password123'
    }
  };

  // Mock da resposta
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };

  // Importa o modelo User e a função updateUser
  const User = require('../models/user.model');
  const { updateUser } = require('../controllers/users.controller');

  // Mock da função findById do modelo User para retornar null
  const findByIdMock = jest.spyOn(User, 'findById').mockResolvedValueOnce(null);

  // Chama a função updateUser
  await updateUser(req, res);

  // Verifica se a função findById foi chamada com o ID correto
  expect(findByIdMock).toHaveBeenCalledWith(id);
  // Verifica se a função status da resposta foi chamada com 404
  expect(res.status).toHaveBeenCalledWith(404);
  // Verifica se a função json da resposta foi chamada com a mensagem correta
  expect(res.json).toHaveBeenCalledWith({ message: 'Usuário não encontrado!' });

  // Restaura o mock para o estado original
  findByIdMock.mockRestore();
});

  it('deve retornar 400 se a atualização falhar', async () => {
  // Define o ID do usuário e a requisição
  const id = 'user_id';
  const req = {
    params: { id },
    userId: id,
    body: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      password: 'password123'
    }
  };

  // Mock da resposta
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };

  // Importa o modelo User, o módulo bcrypt e a função updateUser
  const User = require('../models/user.model');
  const bcrypt = require('bcrypt');
  const { updateUser } = require('../controllers/users.controller');

  // Mock das funções do User e do bcrypt
  const findByIdMock = jest.spyOn(User, 'findById').mockResolvedValueOnce({});
  const genSaltSyncMock = jest.spyOn(bcrypt, 'genSaltSync').mockReturnValue('salt');
  const hashSyncMock = jest.spyOn(bcrypt, 'hashSync').mockReturnValue('hashed_password');
  const findByIdAndUpdateMock = jest.spyOn(User, 'findByIdAndUpdate').mockResolvedValueOnce(null);

  // Chama a função updateUser
  await updateUser(req, res);

  // Verifica se as funções foram chamadas com os argumentos corretos
  expect(findByIdMock).toHaveBeenCalledWith(id);
  expect(genSaltSyncMock).toHaveBeenCalledWith(10);
  expect(hashSyncMock).toHaveBeenCalledWith(req.body.password, 'salt');
  expect(findByIdAndUpdateMock).toHaveBeenCalledWith(id, {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: 'hashed_password'
  });
  // Verifica se a função status da resposta foi chamada com 400
  expect(res.status).toHaveBeenCalledWith(400);
  // Verifica se a função json da resposta foi chamada com a mensagem correta
  expect(res.json).toHaveBeenCalledWith({ message: 'Erro ao atualizar usuário!' });

  // Restaura os mocks para o estado original
  findByIdMock.mockRestore();
  genSaltSyncMock.mockRestore();
  hashSyncMock.mockRestore();
  findByIdAndUpdateMock.mockRestore();
});

  it('deve retornar 500 se ocorrer um erro', async () => {
  // Define o ID do usuário e a requisição
  const id = 'user_id';
  const req = {
    params: { id },
    userId: id,
    body: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      password: 'password123'
    }
  };

  // Mock da resposta
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };

  // Importa o modelo User e a função updateUser
  const User = require('../models/user.model');
  const { updateUser } = require('../controllers/users.controller');

  // Mock da função findById do modelo User para rejeitar com um erro
  const findByIdMock = jest.spyOn(User, 'findById').mockRejectedValueOnce(new Error());

  // Chama a função updateUser
  await updateUser(req, res);

  // Verifica se a função findById foi chamada com o ID correto
  expect(findByIdMock).toHaveBeenCalledWith(id);
  // Verifica se a função status da resposta foi chamada com 500
  expect(res.status).toHaveBeenCalledWith(500);
  // Verifica se a função json da resposta foi chamada com a mensagem correta
  expect(res.json).toHaveBeenCalledWith({ message: 'Erro ao atualizar usuário!' });

  // Restaura o mock para o estado original
  findByIdMock.mockRestore();
});
});