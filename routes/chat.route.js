const { accessChat, getChats, createGroupChat, renameGroup, addToGroup, removeFromGroup } = require('../controllers/chat.controller')
const { jwtValidator } = require('../middlewares/jwt-validator')

const router = require('express').Router()

// Todas la peticiones deben ser protegidas por el jwt
router.use(jwtValidator)

router.post('/', accessChat)
router.get('/', getChats)
router.post('/group', createGroupChat)
router.put('/rename', renameGroup)
router.put('/groupadd', addToGroup)
router.put('/groupremove', removeFromGroup)

module.exports = router
