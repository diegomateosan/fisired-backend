const mongoose = require('mongoose')

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.DB_CNN)
    console.log('DB en línea')
  } catch (error) {
    console.log(error)
    throw new Error('Error conectanse a Mongo')
  }
}

module.exports = {
  dbConnection
}
