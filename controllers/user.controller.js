const { response } = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/user.model')
const Community = require('../models/community.model')
const { generateJWT } = require('../helpers/jwt')

const addUser = async (req, res = response) => {
  const { username, email, password, avatar } = req.body

  try {
    let user = await User.findOne({ email })
    const name = await User.findOne({ username })

    if (name) {
      return res.status(400).json({
        ok: false,
        msg: 'Nombre de usuario no válido.'
      })
    }

    if (user) {
      return res.status(400).json({
        ok: false,
        msg: 'Un usuario existe con ese correo'
      })
    }

    user = new User(req.body)

    // Encriptar contraseña
    const salt = bcrypt.genSaltSync()
    user.password = bcrypt.hashSync(password, salt)

    await user.save()

    // Generar JWT
    const token = await generateJWT(user._id, user.name)

    res.status(201).json({
      ok: true,
      uid: user._id,
      name: user.name,
      msg: 'Usuario creado exitosamete',
      token
    })
  } catch (error) {
    console.log(error.message)
    res.status(500).json({
      ok: false,
      msg: 'Por favor, hable con el administrador'
    })
  }
}

// Ruta para obtener las IDs de las comunidades de un usuario
const getcommunity = async (req, res) => {
  try {
    const userId = req.params.userId
    const user = await User.findById(userId).populate('communities')
    console.log(user)
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }
    res.status(201).json({
      ok: true,
      community: user.communities,
      msg: 'Comunidades encontradas'
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: 'Error al obtener las IDs de las comunidades del usuario'
    })
  }
}

const getUserCommunities = async (req, res) => {
  try {
    // // Obtén el ID del usuario desde los parámetros de la URL
    // const userId = req.params.userId;

    // // Encuentra todas las comunidades donde el usuario es miembro
    // const communities = await Community.find({ members: userId });
    // Obtén el ID del usuario desde los parámetros de la URL
    const userId = req.params.userId

    // Encuentra al usuario por su ID y selecciona sus comunidades
    const user = await User.findById(userId).select('communities')

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }
    res.status(201).json({
      ok: true,
      Community: user.communities,
      msg: 'Comunidades encontradas'
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al obtener las comunidades del usuario' })
  }
}

const updateInfo = async (req, res) => {
  try {
    const userId = req.params.id // Obtener el ID de los parámetros de ruta
    console.log(userId)
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    const { location, interests, bio } = req.body

    // Agregar los nuevos campos si existen en el cuerpo de la solicitud
    if (location) {
      user.location = location
    }
    if (interests) {
      user.interests = interests
    }
    if (bio) {
      user.bio = bio
    }

    // Guardar la actualización en la base de datos
    await user.save()

    res.status(200).json({
      message: 'User info updated successfully'
    })
  } catch (err) {
    res.status(500).json({
      message: 'Error updating user info'
    })
  }
}

const getUser = async (req, res) => {
  try {
    const userId = req.params.id

    // Busca el usuario por ID en la base de datos
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    // Si se encuentra el usuario, se envía como respuesta
    res.status(200).json(user)
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el usuario' })
  }
}

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id

    // Busca y elimina el usuario por ID en la base de datos
    const deletedUser = await User.findByIdAndRemove(userId)

    if (!deletedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    // Si el usuario se eliminó correctamente, se envía una respuesta de éxito
    res.status(200).json({ message: 'Usuario eliminado exitosamente' })
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar el usuario' })
  }
}
const searchUser = async (req, res) => {
  try {
    const searchValue = req.query.search
    if (!searchValue) {
      return res.status(400).json({ message: 'Debes proporcionar un valor de búsqueda.' })
    }

    // Realiza la búsqueda en la base de datos
    const users = await User.find({
      $or: [
        // { _id: searchValue }, // Búsqueda por ID
        { email: searchValue }, // Búsqueda por email
        { username: searchValue } // Búsqueda por username
      ]
    })

    if (users.length === 0) {
      return res.status(404).json({
        message: 'No se encontraron usuarios que coincidan con la búsqueda.'
      })
    }

    res.json(users)
  } catch (err) {
    res.status(500).json({ message: 'Error al buscar usuarios.' })
  }
}
module.exports = {
  addUser,
  updateInfo,
  getUser,
  deleteUser,
  getcommunity,
  getUserCommunities,
  searchUser
}
