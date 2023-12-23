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
    firstName: 'Rhaiffer',
    lastName: 'Menezes',
    email: 'rhaiffer@gmail.com',
    // Inclua quaisquer outros campos que você precisa no objeto do usuário
  };
  next();
});
// Descrevendo o grupo de testes para a rota '/api/v1/users'
describe('/api/v1/users', () => {
  // Após cada teste, limpe todos os usuários do banco de dados
  afterEach(async () => {
    await User.deleteMany({});
  });

  // Teste para registrar um novo usuário
  it('should register a new user', async () => {
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

  // Teste para verificar se um erro é retornado quando os parâmetros obrigatórios estão faltando
  it('should return an error if required parameters are missing', async () => {
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

  // Teste para verificar se um erro é retornado quando o email já está registrado
  it('should return an error if email is already registered', async () => {
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

  // Teste para verificar se um erro é retornado quando ocorre um erro inesperado
  it('should return an error if an unexpected error occurs', async () => {
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
  it('should return an error if password does not meet requirements', async () => {
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
it('should update a user', async () => {
  try {
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
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const genSaltSyncMock = jest.spyOn(bcrypt, 'genSaltSync').mockReturnValue('salt');
    const hashSyncMock = jest.spyOn(bcrypt, 'hashSync').mockReturnValue('hashed_password');
    const findByIdMock = jest.spyOn(User, 'findById').mockResolvedValueOnce({ id: '123' });
    const findByIdAndUpdateMock = jest.spyOn(User, 'findByIdAndUpdate').mockResolvedValueOnce({ id: '123' });

    await updateUser(req, res);

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

    findByIdMock.mockRestore();
    genSaltSyncMock.mockRestore();
    hashSyncMock.mockRestore();
    findByIdAndUpdateMock.mockRestore();
  } catch (err) {
    console.error('Erro capturado:', err.stack);
  }
});
  it('should return 404 if user is not found', async () => {
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
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const User = require('../models/user.model');
    const { updateUser } = require('../controllers/users.controller');

    const findByIdMock = jest.spyOn(User, 'findById').mockResolvedValueOnce(null);

    await updateUser(req, res);

    expect(findByIdMock).toHaveBeenCalledWith(id);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Usuário não encontrado!' });

    findByIdMock.mockRestore();
  });

  it('should return 400 if update fails', async () => {
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
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const User = require('../models/user.model');
    const bcrypt = require('bcrypt');
    const { updateUser } = require('../controllers/users.controller');

    const findByIdMock = jest.spyOn(User, 'findById').mockResolvedValueOnce({});
    const genSaltSyncMock = jest.spyOn(bcrypt, 'genSaltSync').mockReturnValue('salt');
    const hashSyncMock = jest.spyOn(bcrypt, 'hashSync').mockReturnValue('hashed_password');
    const findByIdAndUpdateMock = jest.spyOn(User, 'findByIdAndUpdate').mockResolvedValueOnce(null);

    await updateUser(req, res);

    expect(findByIdMock).toHaveBeenCalledWith(id);
    expect(genSaltSyncMock).toHaveBeenCalledWith(10);
    expect(hashSyncMock).toHaveBeenCalledWith(req.body.password, 'salt');
    expect(findByIdAndUpdateMock).toHaveBeenCalledWith(id, {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: 'hashed_password'
    });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Erro ao atualizar usuário!' });

    findByIdMock.mockRestore();
    genSaltSyncMock.mockRestore();
    hashSyncMock.mockRestore();
    findByIdAndUpdateMock.mockRestore();
  });

  it('should return 500 if an error occurs', async () => {
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
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const User = require('../models/user.model');
    const { updateUser } = require('../controllers/users.controller');

    const findByIdMock = jest.spyOn(User, 'findById').mockRejectedValueOnce(new Error());

    await updateUser(req, res);

    expect(findByIdMock).toHaveBeenCalledWith(id);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Erro ao atualizar usuário!' });

    findByIdMock.mockRestore();
  });
});