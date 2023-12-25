const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    if (process.env.NODE_ENV !== 'test') {
  console.log('MongoDB conectado...');
};
  } catch (err) {
    console.error(err.message);
    // Sai do processo com falha
    process.exit(1);
  }
};

module.exports = connectDB;