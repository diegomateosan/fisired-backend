const { createUser, loginUser, renewToken } = require('../controllers/auth.controller')
const { jwtValidator } = require('../middlewares/jwt-validator')

const router = require('express').Router()

// REGISTER
router.post('/register', createUser)

// LOGIN
router.post('/login', loginUser)

// REVALIDATE TOKEN
router.get('/renew', jwtValidator, renewToken)

module.exports = router
