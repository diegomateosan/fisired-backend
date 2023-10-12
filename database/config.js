const mongoose = require('mongoose');

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('DB en línea');
  } catch (error) {
    console.log(error);
    throw new Error('Error conectanse a Mongo');
  }
};

module.exports = {
  dbConnection,
};
