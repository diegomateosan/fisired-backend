const ServiceResponse = require('../helpers/serviceResponse');
const Community = require('../models/community.model');
const { createCustomError } = require('../helpers/createCustomError');
const postModel = require('../models/post.model');

const getAllCommunity = async (req, res) => {
  const response = new ServiceResponse();
  try {
    const group = await Community.find();
    response.setSucessResponse('Todos los Grupos Encontrados Exitosamente', group);
  } catch (error) {
    response.setErrorResponse(error.message, 500);
  } finally {
    res.send(response);
  }
};

const getOneCommunity = async (req, res) => {
  const communityId = req.params.communityId;
  const response = new ServiceResponse();
  try {
    const valid = await Community.findById(communityId);

    if (!valid) {
      throw createCustomError('No existe una Grupo con ese id', 404);
    }

    const comunidad = await Community.findById(communityId);
    response.setSucessResponse('Grupo  Encontrado Exitosamente', comunidad);
  } catch (error) {
    response.setErrorResponse(error.message, error.code);
  } finally {
    res.send(response);
  }
};

const getMembers = async (req, res) => {
  const communityId = req.params.communityId;
  const response = new ServiceResponse();
  try {
    const valid = await Community.findById(communityId);

    if (!valid) {
      throw createCustomError('No existe una Grupo con ese id', 404);
    }

    const comunidad = await Community.findById(communityId);
    response.setSucessResponse('Miembros encontrados Exitosamente', comunidad.members);
  } catch (error) {
    response.setErrorResponse(error.message, error.code);
  } finally {
    res.send(response);
  }
};

const addCommunity = async (req, res) => {
  const { name, description, banner } = req.body;
  const creator = req.uid;
  const response = new ServiceResponse();

  try {
    const newCommunty = new Community({
      name,
      description,
      banner,
      creator,
    });

    const comunidad = await newCommunty.save();

    await Community.findByIdAndUpdate(
      comunidad._id,
      { $push: { members: creator } },
      { new: true }
    );

    await Community.findByIdAndUpdate(
      comunidad._id,
      { $push: { moderators: creator } },
      { new: true }
    );

    response.setSucessResponse('Grupo creado Exitosamente', comunidad);
  } catch (error) {
    response.setErrorResponse(error.message, error.code);
  } finally {
    res.send(response);
  }
};

const updateCommunity = async (req, res) => {
  const { description, banner } = req.body;
  const communityId = req.params.communityId;
  const response = new ServiceResponse();
  const uid = req.uid;
  try {
    const valid = await Community.findById(communityId);

    if (!valid) {
      throw createCustomError('No existe una Grupo con ese id', 404);
    }

    if (!valid.moderators.includes(uid)) {
      throw createCustomError('No tiene permiso para publicar en este grupo', 401);
    }

    const comunidad = await Community.findByIdAndUpdate(
      communityId,
      { description, banner },
      { new: true }
    );
    response.setSucessResponse('Grupo Actualizado Exitosamente', comunidad);
  } catch (error) {
    response.setErrorResponse(error.message, error.code);
  } finally {
    res.send(response);
  }
};

const deleteCommunity = async (req, res) => {
  const communityId = req.params.communityId;
  const response = new ServiceResponse();

  const uid = req.uid;
  try {
    const valid = await Community.findById(communityId);

    if (!valid) {
      throw createCustomError('No existe una Grupo con ese id', 404);
    }
    if (!valid.moderators.includes(uid)) {
      throw createCustomError('No tiene permiso para publicar en este grupo', 401);
    }

    const comunidad = await Community.findByIdAndRemove(communityId);
    response.setSucessResponse('Grupo Eliminado Exitosamente', comunidad);
  } catch (error) {
    response.setErrorResponse(error.message, error.code);
  } finally {
    res.send(response);
  }
};

const joinCommunity = async (req, res) => {
  const communityId = req.params.communityId;
  const response = new ServiceResponse();
  try {
    const valid = await Community.findById(communityId);

    if (!valid) {
      throw createCustomError('No existe una Grupo con ese id', 404);
    }
    const userID = req.uid;
    const comunidad = await Community.findByIdAndUpdate(
      communityId,
      { $push: { members: userID } },
      { new: true }
    );
    response.setSucessResponse('Usuario Agregado Correctamente', comunidad);
  } catch (error) {
    response.setErrorResponse(error.message, error.code);
  } finally {
    res.send(response);
  }
};

const leaveCommunity = async (req, res) => {
  const communityId = req.params.communityId;
  const response = new ServiceResponse();
  try {
    const valid = await Community.findById(communityId);

    if (!valid) {
      throw createCustomError('No existe una Grupo con ese id', 404);
    }
    const userID = req.uid;
    const comunidad = await Community.updateMany(
      {
        $or: [{ members: userID }, { moderators: userID }],
      },
      {
        $pull: {
          members: userID,
          moderators: userID,
        },
      },
      { new: true }
    );

    response.setSucessResponse('Usuario ha salido del grupo Correctamente', comunidad);
  } catch (error) {
    response.setErrorResponse(error.message, error.code);
  } finally {
    res.send(response);
  }
};

const addModerator = async (req, res) => {
  const { userId } = req.body;
  const communityId = req.params.communityId;
  const response = new ServiceResponse();
  const uid = req.uid;
  try {
    if (!valid.moderators.includes(uid)) {
      throw createCustomError('No tiene permiso para publicar en este grupo', 401);
    }
    const valid = await Community.findById(communityId);

    if (!valid) {
      throw createCustomError('No existe una Grupo con ese id', 404);
    }

    const comunidad = await Community.findByIdAndUpdate(
      communityId,
      { $push: { moderators: userId } },
      { new: true }
    );
    response.setSucessResponse('Usuario Ascendido Correctamente', comunidad);
  } catch (error) {
    response.setErrorResponse(error.message, error.code);
  } finally {
    res.send(response);
  }
};

const deleteMember = async (req, res) => {
  const { userId } = req.body;
  const communityId = req.params.communityId;
  const response = new ServiceResponse();
  const uid = req.uid;
  try {
    if (!valid.moderators.includes(uid)) {
      throw createCustomError('No tiene permiso para publicar en este grupo', 401);
    }
    const valid = await Community.findById(communityId);

    if (!valid) {
      throw createCustomError('No existe una Grupo con ese id', 404);
    }

    const comunidad = await Community.updateMany(
      {
        $or: [{ members: userId }, { moderators: userId }],
      },
      {
        $pull: {
          members: userId,
          moderators: userId,
        },
      },
      { new: true }
    );

    response.setSucessResponse('Usuario ha salido del grupo Correctamente', comunidad);
  } catch (error) {
    response.setErrorResponse(error.message, error.code);
  } finally {
    res.send(response);
  }
};

const addPostGroup = async (req, res) => {
  const communityId = req.params.communityId;
  const response = new ServiceResponse();
  const uid = req.uid;
  try {
    const valid = await Community.findById(communityId);
    if (!valid) {
      throw createCustomError('No existe una Grupo con ese id', 404);
    }
    if (!valid.members.includes(uid)) {
      throw createCustomError('No tiene permiso para publicar en este grupo', 401);
    }

    const newPost = new postModel(req.body);
    newPost.user = uid;

    const savedPost = await newPost.save();
    await Community.findByIdAndUpdate(
      communityId,
      { $push: { Posts: newPost.id } },
      { new: true }
    );
    response.setSucessResponse('Publicación en grupo creada exitosamente', savedPost);
  } catch (error) {
    response.setErrorResponse(error.message, error.code);
  } finally {
    res.send(response);
  }
};

const getPostRecently = async (req, res) => {
  const communityId = req.params.communityId;
  const response = new ServiceResponse();
  try {
    const valid = await Community.findById(communityId).populate({
      path: 'Posts',
      options: { sort: { createdAt: 'desc' }, limit: 1 },
    });

    if (!valid) {
      throw createCustomError('No existe una Grupo con ese id', 404);
    }

    response.setSucessResponse('Publicación de grupo obtenida exitosamente', valid);
  } catch (error) {
    response.setErrorResponse(error.message, error.code);
  } finally {
    res.send(response);
  }
};

const getAllCommunityUser = async (req, res) => {
  const uid = req.uid;
  const response = new ServiceResponse();
  try {
    const valid = await Community.find({ members: uid }).sort({ createdAt: -1 });
    if (!valid) {
      throw createCustomError('El usuario no esta asignado a ningun grupo', 404);
    }
    response.setSucessResponse('Grupos encontrados obtenida exitosamente', valid);
  } catch (error) {
    response.setErrorResponse(error.message, error.code);
  } finally {
    res.send(response);
  }
};

module.exports = {
  getAllCommunity,
  addCommunity,
  getOneCommunity,
  getMembers,
  updateCommunity,
  deleteCommunity,
  joinCommunity,
  leaveCommunity,
  addModerator,
  deleteMember,
  addPostGroup,
  getPostRecently,
  getAllCommunityUser,
};
