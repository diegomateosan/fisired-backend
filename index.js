const express = require('express')
require('dotenv').config()

const { dbConnection } = require('./database/config')

const cors = require('cors')

// Crear servidor express
const app = express()

// Base de datos
dbConnection()

// CORS
app.use(cors())

// Lectura y parseo del body
app.use(express.json())

// Rutas
app.use('/api/auth', require('./routes/auth.route'))
app.use('/api/users', require('./routes/user.route'))
app.use('/api/posts', require('./routes/post.route'))
app.use('/api/chat', require('./routes/chat.route'))
app.use('/api/message', require('./routes/message.route'))

// Escuchas peticines
const server = app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo en puerto ${process.env.PORT}`)
})

// socket.io
const io = require('socket.io')(server, {
  pingTimeout: 60000,
  cors: {
    origin: 'http://localhost:3000'
  }
})

io.on('connection', (socket) => {
  console.log('Connected to socket.io')

  // Creating a new socket where the frontend will send some data and will join a room
  socket.on('setup', (userData) => {
    socket.join(userData._id)
    console.log(userData._id)
    socket.emit('connected')
  })

  socket.on('join chat', (room) => {
    socket.join(room)
    console.log('User Joined Room: ' + room)
  })

  socket.on('typing', (room) => {
    socket.in(room).emit('typing')
  })

  socket.on('stop typing', (room) => {
    socket.in(room).emit('stop typing')
  })

  socket.on('new message', (newMessageRecieved) => {
    const chat = newMessageRecieved.chat
    if (!chat.users) return console.log('chat.users not defined')

    chat.users.forEach(user => {
      if (user._id === newMessageRecieved.sender._id) return
      socket.in(user._id).emit('message recieved', newMessageRecieved)
    })
  })
})
