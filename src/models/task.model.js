const mongoose = require('mongoose');
const format = require('date-fns');

// Definindo o esquema para a coleção 'tasks'
const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pendente', 'Em andamento', 'Concluída'],
    default: 'Pendente'
  },

  createdAt: {
    type: String,
    default: () => format(new Date(), 'dd/MM/yyyy')
  },

  updatedAt: {
    type: String,
    default: null
  },
  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
},
{
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: false
  }
}
);

// Criando o modelo
const Task = mongoose.model('Task', TaskSchema);

module.exports = Task;