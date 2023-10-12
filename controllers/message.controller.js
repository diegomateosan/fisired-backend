const Chat = require('../models/chat.model')
const Message = require('../models/message.model')
const User = require('../models/user.model')

const sendMessage = async (req, res) => {
  const { content, chatId } = req.body

  if (!content || !chatId) {
    res.status(400).json({
      ok: false,
      msg: 'Faltan campos obligatorios'
    })
  }

  const newMessage = {
    sender: req.uid,
    content,
    chat: chatId
  }

  try {
    let message = await Message.create(newMessage)

    message = await message.populate('sender', 'name profilePicture')
    message = await message.populate('chat')
    message = await User.populate(message, {
      path: 'chat.users',
      select: 'name profilePicture email'
    })

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message })

    res.status(201).json({
      ok: true,
      message
    })
  } catch (err) {
    console.log(err.message)
    res.status(500).json({
      ok: false,
      msg: 'Por favor, hable con el administrador'
    })
  }
}

const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', 'name profilePicture email')
      .populate('chat')

    res.status(200).json({
      ok: true,
      allMessages: messages
    })
  } catch (err) {
    console.log(err.message)
    res.status(500).json({
      ok: false,
      msg: 'Por favor, hable con el administrador'
    })
  }
}

module.exports = { sendMessage, getAllMessages }
