const express = require('express')
require('dotenv').config()
const bodyParser = require('body-parser')
const { dbConnection } = require('./database/config')

const cors = require('cors')

// Crear servidor express
const app = express()

// Base de datoss
dbConnection()

// CORS
app.use(cors())

// Lectura y parseo del body
app.use(bodyParser.json({ limit: '100mb' }))
app.use(bodyParser.urlencoded({
  limit: '100mb',
  extended: true
}))
app.use(express.json())

// Rutas
app.use('/api/auth', require('./routes/auth.route'))
app.use('/api/users', require('./routes/user.route'))
app.use('/api/posts', require('./routes/post.route'))
app.use('/api/comments', require('./routes/comment.route'))
app.use('/api/communitys', require('./routes/community.route'))
app.use('/api/chats', require('./routes/chat.route'))
app.use('/api/messages', require('./routes/message.route'))

// Escuchar peticines
const server = app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo en puerto ${process.env.PORT}`)
})

// socket.io
const io = require('socket.io')(server, {
  pingTimeout: 60000,
  cors: {
    origin: '*'
  }
})
// Configura las rutas de Socket.io
require('./routes/socket.route')(io)
