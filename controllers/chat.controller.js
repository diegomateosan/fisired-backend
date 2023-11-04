const Chat = require('../models/chat.model')
const User = require('../models/user.model')

const accessChat = async (req, res) => {
  const { userId } = req.body

  if (!userId) {
    console.log('UserId is required')
    res.status(400).json({
      ok: false,
      msg: 'Por favor, hable con el administrador'
    })
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.uid } } },
      { users: { $elemMatch: { $eq: userId } } }
    ]
  }).populate('users', '-password')
    .populate('latestMessage')

  isChat = await User.populate(isChat, {
    path: 'latestMessage.sender',
    select: 'username profilePicture email'
  })

  if (isChat.length > 0) {
    res.status(200).json({
      ok: true,
      fullChat: isChat[0]
    })
  } else {
    const chatData = {
      chatName: 'sender',
      isGroupChat: false,
      users: [req.uid, userId]
    }

    try {
      const createdChat = await Chat.create(chatData)
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate('users', '-password')
      res.status(200).json({
        ok: true,
        fullChat
      })
    } catch (err) {
      console.log(err.message)
      res.status(400).json({
        ok: false,
        msg: 'Por favor, hable con el administrador'
      })
    }
  }
}

const getChats = async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.uid } } })
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 })
      .then(async (response) => {
        response = await User.populate(response, {
          path: 'latestMessage.sender',
          select: 'username profilePicture email'
        })

        res.status(200).json({
          ok: true,
          allChats: response
        })
      })
  } catch (err) {
    console.log(err.message)
    res.status(500).json({
      ok: false,
      msg: 'Por favor, hable con el administrador'
    })
  }
}

const createGroupChat = async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).json({
      ok: false,
      msg: 'Por favor, llene todos los campos'
    })
  }

  const users = JSON.parse(req.body.users)

  if (users.length < 2) {
    return res.status(400).json({
      ok: false,
      msg: 'Más de 2 usuarios es necesario para formar un grupo'
    })
  }

  users.push(req.uid)

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users,
      isGroupChat: true,
      groupAdmin: req.uid
    })

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate('users', '-password')
      .populate('groupAdmin', '-password')

    return res.status(200).json({
      ok: true,
      fullGroupChat
    })
  } catch (err) {
    console.error(err.message)
    return res.status(500).json({
      ok: false,
      msg: 'Por favor, hable con el administrador'
    })
  }
}

const renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body

  try {
    const updatedChat = await Chat.findByIdAndUpdate(chatId,
      { chatName },
      { new: true }
    ).populate('users', '-password')
      .populate('groupAdmin', '-password')

    if (!updatedChat) {
      res.status(404).json({
        ok: false,
        msg: 'Chat no encontrado'
      })
    }

    res.status(200).json({
      ok: true,
      updatedChat
    })
  } catch (err) {
    console.log(err.message)
    res.status(500).json({
      ok: false,
      msg: 'Por favor, hable con el administrador'
    })
  }
}

const addToGroup = async (req, res) => {
  const { chatId, userId } = req.body

  try {
    const added = await Chat.findByIdAndUpdate(chatId,
      { $push: { users: userId } },
      { new: true }
    ).populate('users', '-password')
      .populate('groupAdmin', '-password')

    if (!added) {
      res.status(404).json({
        ok: false,
        msg: 'Chat no encontrado'
      })
    }

    res.status(200).json({
      ok: true,
      groupWithNewUser: added
    })
  } catch (err) {
    console.log(err.message)
    res.status(500).json({
      ok: false,
      msg: 'Por favor, hable con el administrador'
    })
  }
}

const removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body

  try {
    const remove = await Chat.findByIdAndUpdate(chatId,
      { $pull: { users: userId } },
      { new: true }
    ).populate('users', '-password')
      .populate('groupAdmin', '-password')

    if (!remove) {
      res.status(404).json({
        ok: false,
        msg: 'Chat no encontrado'
      })
    }

    res.status(200).json({
      ok: true,
      groupWithUserRemoved: remove
    })
  } catch (err) {
    console.log(err.message)
    res.status(500).json({
      ok: false,
      msg: 'Por favor, hable con el administrador'
    })
  }
}

module.exports = { accessChat, getChats, createGroupChat, renameGroup, addToGroup, removeFromGroup }
