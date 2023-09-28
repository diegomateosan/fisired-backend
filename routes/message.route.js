const { sendMessage, getAllMessages } = require('../controllers/message.controller')
const { jwtValidator } = require('../middlewares/jwt-validator')

const router = require('express').Router()

// Todas la peticiones deben ser protegidas por el jwt
router.use(jwtValidator)

router.post('/', sendMessage)
router.get('/:chatId', getAllMessages)

module.exports = router
