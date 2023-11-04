const ServiceResponse = require('../helpers/serviceResponse');
const Community = require('../models/community.model');
const { createCustomError } = require('../helpers/createCustomError');
const postModel = require('../models/post.model');
const userModel = require('../models/user.model');
const cloudinary = require('../helpers/cloudinary');

const getAllCommunity = async (req, res) => {
  const response = new ServiceResponse();
  const join = req.params.join;
  const user = req.uid;
  let group;
  try {
    if (join === 'true') {
      group = await Community.find({
        members: { $nin: [user] },
      });
    } else {
      group = await Community.find();
    }

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

    const comunidad = await Community.findById(communityId)
      .populate('members moderators creator')
      .populate({
        path: 'Posts',
        populate: {
          path: 'user',
          model: 'User',
        },
      });

    response.setSucessResponse('Grupo  Encontrado Exitosamente', comunidad);
  } catch (error) {
    response.setErrorResponse(error.message, error.code);
  } finally {
    res.send(response);
  }
};

const getKnowAdmin = async (req, res) => {
  const communityId = req.params.communityId;
  const response = new ServiceResponse();
  const user = req.uid;
  try {
    const valid = await Community.findById(communityId);

    if (!valid) {
      throw createCustomError('No existe una Grupo con ese id', 404);
    }
    response.setSucessResponse('Usted es administrador', valid.moderators.includes(user));
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
    const valid = await Community.findById(communityId).populate('members');

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

    await userModel.findByIdAndUpdate(
      creator,
      { $push: { communities: comunidad._id } },
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
    ).populate('members moderators creator Posts');
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

    await userModel.findByIdAndUpdate(
      userID,
      { $push: { communities: communityId } },
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
  // Si soy admin y soy el ultimo admin, debo designar a otro admin antes de salir.
  const communityId = req.params.communityId;
  const response = new ServiceResponse();
  try {
    const valid = await Community.findById(communityId);

    if (!valid) {
      throw createCustomError('No existe una Grupo con ese id', 404);
    }
    const userID = req.uid;
    const comunidad = await Community.updateOne(
      { _id: communityId },
      {
        $pull: { members: userID, moderators: userID },
      },
      { new: true }
    );

    await userModel.findByIdAndUpdate(
      userID,
      { $pull: { communities: communityId } },
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
    const valid = await Community.findById(communityId);

    if (!valid) {
      throw createCustomError('No existe una Grupo con ese id', 404);
    }

    if (!valid.moderators.includes(uid)) {
      throw createCustomError('No tiene permiso de administrador grupo', 401);
    }

    const comunidad = await Community.findByIdAndUpdate(
      communityId,
      { $push: { moderators: userId } },
      { new: true }
    ).populate('members moderators creator Posts');

    response.setSucessResponse('Usuario Ascendido Correctamente', comunidad);
  } catch (error) {
    response.setErrorResponse(error.message, error.code);
  } finally {
    res.send(response);
  }
};

const deleteModerator = async (req, res) => {
  const { userId } = req.body;
  const communityId = req.params.communityId;
  const response = new ServiceResponse();
  const uid = req.uid;
  try {
    const valid = await Community.findById(communityId);

    if (!valid) {
      throw createCustomError('No existe una Grupo con ese id', 404);
    }

    if (!valid.moderators.includes(uid)) {
      throw createCustomError('No tiene permiso de administrador grupo', 401);
    }

    const comunidad = await Community.findByIdAndUpdate(
      communityId,
      { $pull: { moderators: userId } },
      { new: true }
    ).populate('members moderators creator Posts');

    response.setSucessResponse('Usuario Descendido Correctamente', comunidad);
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
    const valid = await Community.findById(communityId);

    if (!valid) {
      throw createCustomError('No existe una Grupo con ese id', 404);
    }
    if (!valid.moderators.includes(uid)) {
      throw createCustomError('No tiene permisos de administrador en este grupo', 401);
    }

    const comunidad = await Community.findByIdAndUpdate(
      communityId,
      { $pull: { moderators: userId, members: userId } },
      { new: true }
    ).populate('members moderators creator Posts');

    await userModel.findByIdAndUpdate(
      userId,
      { $pull: { communities: communityId } },
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
    if (req.body.img !== '') {
      const result = await cloudinary.uploader.upload(req.body.img, {
        folder: 'posts',
      });
      newPost.img = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    } else {
      newPost.img = {
        public_id: '',
        url: '',
      };
    }

    const savedPost = await newPost.save();
    await savedPost.populate('user', '-password');
    const data = await Community.findByIdAndUpdate(
      communityId,
      { $push: { Posts: newPost.id } },
      { new: true }
    ).populate('members moderators creator Posts');
    response.setSucessResponse('Publicación en grupo creada exitosamente', data);
  } catch (error) {
    response.setErrorResponse(error.message, error.code);
  } finally {
    res.send(response);
  }
};

const getPostRecently = async (req, res) => {
  const response = new ServiceResponse();
  const uid = req.uid;
  const usuario = await userModel.findById(uid);
  let postComunidades = [];
  try {
    for (let i = 0; i < usuario.communities.length; i++) {
      let valid = await Community.findById(usuario.communities[i]).populate({
        path: 'Posts',
        options: { sort: { createdAt: 'desc' }, limit: 1 },
        populate: {
          path: 'user',
        },
      });

      if (!valid) {
        throw createCustomError('No existe una Grupo con ese id', 404);
      }
      postComunidades.push(valid);
    }

    response.setSucessResponse('Publicación de grupo obtenida exitosamente', postComunidades);
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
    response.setSucessResponse(
      'Grupos donde el usuario pertenece obtenidos exitosamente',
      valid
    );
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
  getKnowAdmin,
  deleteModerator,
};
