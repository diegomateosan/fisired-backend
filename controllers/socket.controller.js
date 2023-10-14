const Post = require('../models/post.model')

const socketControllers = (io) => {
  io.on('connection', (socket) => {
    console.log(`Cliente conectado: ${socket.id}`)
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

      chat.users.forEach((user) => {
        if (user._id === newMessageRecieved.sender._id) return
        socket.in(user._id).emit('message recieved', newMessageRecieved)
      })
    })

    socket.on('likePost', async (postId, userId) => {
      try {
        const post = await Post.findById(postId)

        if (!post) {
          // Manejar errores si la publicación no existe
          socket.emit('likeError', 'La publicación no existe')
          return
        }

        if (!post.likes.includes(userId)) {
          await post.updateOne({ $push: { likes: userId } })
        } else {
          await post.updateOne({ $pull: { likes: userId } })
        }

        const updatedPost = await Post.findById(postId)

        // Emitir un evento de "like" con los datos actualizados a todos los clientes
        io.emit('like', { postId, likesCount: updatedPost.likes.length })
      } catch (error) {
        // Manejar errores generales
        console.error(error)
        socket.emit('likeError', 'Ocurrió un error al procesar el like')
      }
    })

    socket.on('disconnect', () => {
      console.log(`Cliente desconectado: ${socket.id}`)
    })
  })
}

module.exports = socketControllers
