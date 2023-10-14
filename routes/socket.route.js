const socketControllers = require('../controllers/socket.controller')

module.exports = (io) => {
  socketControllers(io)
}
