const express = require('express')
require('dotenv').config()

const { dbConnection } = require('./database/config')

const cors = require('cors')

// Crear servidor express
const app = express()

// Base de datoss
dbConnection()

// CORS
app.use(cors())

// Lectua y parseo del body
app.use(express.json())

// Rutas
app.use('/api/auth', require('./routes/auth.route'))
app.use('/api/users', require('./routes/user.route'))
app.use('/api/posts', require('./routes/post.route'))

// Escuchas peticines
app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo en puerto ${process.env.PORT}`)
})
