const Post = require('../models/post.model')

let onlineUsers = []

const socketControllers = (io) => {
  io.on('connection', (socket) => {
    const id = socket.handshake.query.id
    socket.join(id)

    console.log(`Cliente conectado: ${socket.id}`)

    socket.on('sendMessage', (newMessageRecieved) => {
      const recipients = newMessageRecieved.chat.users
      // const text = newMessageRecieved.content
      console.log('recipients', recipients)
      recipients.forEach(recipient => {
        console.log(recipient._id)
        // const newRecipients = recipients.filter(r => r._id !== recipient._id)
        // newRecipients.push(id)
        socket.broadcast.to(recipient._id).emit('receiveMessage', newMessageRecieved)
      })
    })

    socket.on('addNewUser', (userId) => {
      !onlineUsers.some(user => user.userId === userId) &&
        onlineUsers.push({
          userId,
          socketId: socket.id
        })
      console.log('onlineUers', onlineUsers)
      io.emit('getOnlineUsers', onlineUsers)
    })

    // socket.on('setup', (userData) => {
    //   socket.join(userData._id)
    //   socket.emit('connected')
    // })

    // socket.on('joinChat', (room) => {
    //   console.log('join_chat', room)
    //   socket.join(room)
    // })

    // socket.on('typing', (room) => {
    //   console.log('typing,chat', room)
    //   socket.in(room).emit('typing')
    // })

    // socket.on('stop typing', (room) => {
    //   console.log('room_id', room)
    //   socket.in(room).emit('stop typing')
    // })

    // socket.on('sendMessage', (newMessageRecieved) => {
    //   const chat = newMessageRecieved.chat
    //   if (!chat.users) return console.log('chat.users not defined')
    //   chat.users.forEach((user) => {
    //     if (user._id === newMessageRecieved.sender._id) return
    //     io.to(user._id).emit('getMessage', newMessageRecieved)
    //   })
    // })

    // socket.on('sendMessage', (newMessageReceived) => {
    //   console.log('ou', onlineUsers)
    //   console.log(newMessageReceived.sender._id)
    //   const receiver = onlineUsers.find(user => user.userId !== newMessageReceived.sender._id)
    //   console.log('receiver', receiver)
    //   if (receiver) {
    //     console.log('socket', receiver.socketId)
    //     console.log('socket', newMessageReceived)
    //     io.to(receiver.socketId).emit('getMessage', newMessageReceived)
    //   }
    // })

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
      onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id)
      io.emit('getOnlineUsers', onlineUsers)
    })

    // socket.off('setup', (userData) => {
    //   console.log('Usuario desconectado')
    //   socket.leave(userData._id)
    // })
  })
}

module.exports = socketControllers
