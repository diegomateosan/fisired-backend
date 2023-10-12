const ServiceResponse = require("../helpers/serviceResponse");
const Community = require("../models/community.model");
const User = require("../models/user.model");

const getAllCommunity = async (req, res) => {
  const response = new ServiceResponse();
  try {
    const group = await Community.find();
    response.setSucessResponse(
      "Todos los Grupos Encontrados Exitosamente",
      group
    );
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
      throw new Error("No existe una Grupo con ese id");
    }

    const comunidad = await Community.findById(communityId);
    response.setSucessResponse("Grupo  Encontrado Exitosamente", comunidad);
  } catch (error) {
    response.setErrorResponse(error.message, 500);
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
      throw new Error("No existe una Grupo con ese id");
    }

    const comunidad = await Community.findById(communityId);
    response.setSucessResponse(
      "Miembros encontrados Exitosamente",
      comunidad.members
    );
  } catch (error) {
    response.setErrorResponse(error.message, 500);
  } finally {
    res.send(response);
  }
};

const addCommunity = async (req, res) => {
  const { name, description, banner } = req.body;
  // Pasar el userId por uid
  const creator = "6503399db637b81eaa4140d8";
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

    response.setSucessResponse("Grupo creado Exitosamente", comunidad);
  } catch (error) {
    response.setErrorResponse(error.message, 500);
  } finally {
    res.send(response);
  }
};

const updateCommunity = async (req, res) => {
  const { description, banner } = req.body;
  const communityId = req.params.communityId;
  const response = new ServiceResponse();
  try {
    const valid = await Community.findById(communityId);

    if (!valid) {
      throw new Error("No existe una Grupo con ese id");
    }

    const comunidad = await Community.findByIdAndUpdate(
      communityId,
      { description, banner },
      { new: true }
    );
    response.setSucessResponse("Grupo Actualizado Exitosamente", comunidad);
  } catch (error) {
    response.setErrorResponse(error.message, 500);
  } finally {
    res.send(response);
  }
};

const deleteCommunity = async (req, res) => {
  const communityId = req.params.communityId;
  const response = new ServiceResponse();
  try {
    const valid = await Community.findById(communityId);

    if (!valid) {
      throw new Error("No existe una Grupo con ese id");
    }

    const comunidad = await Community.findByIdAndRemove(communityId);
    response.setSucessResponse("Grupo Eliminado Exitosamente", comunidad);
  } catch (error) {
    response.setErrorResponse(error.message, 500);
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
      throw new Error("No existe una Grupo con ese id");
    }
    // OBTENER EL ID DE USUARIO POR req
    // const userID = '6515c33e51a64e79d609fa86'
    const userID = "6524c7ca6660dc93fc85476d";
    const comunidad = await Community.findByIdAndUpdate(
      communityId,
      { $push: { members: userID } },
      { new: true }
    );

    const user = await User.findById(userID);
    user.communities.push(communityId);
    await user.save();

    response.setSucessResponse("Usuario Agregado Correctamente", comunidad);
  } catch (error) {
    response.setErrorResponse(error.message, 500);
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
      throw new Error("No existe una Grupo con ese id");
    }
    // OBTENER EL ID DE USUARIO POR req
    const userID = "6515c33e51a64e79d609fa86";
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

    response.setSucessResponse(
      "Usuario ha salido del grupo Correctamente",
      comunidad
    );
  } catch (error) {
    response.setErrorResponse(error.message, 500);
  } finally {
    res.send(response);
  }
};

const addModerator = async (req, res) => {
  const { userId } = req.body;
  const communityId = req.params.communityId;
  const response = new ServiceResponse();
  try {
    // validar si el que haciende es moderador

    const valid = await Community.findById(communityId);

    if (!valid) {
      throw new Error("No existe una Grupo con ese id");
    }
    const comunidad = await Community.findByIdAndUpdate(
      communityId,
      { $push: { moderators: userId } },
      { new: true }
    );
    response.setSucessResponse("Usuario Ascendido Correctamente", comunidad);
  } catch (error) {
    response.setErrorResponse(error.message, 500);
  } finally {
    res.send(response);
  }
};

const deleteMember = async (req, res) => {
  const { userId } = req.body;
  const communityId = req.params.communityId;
  const response = new ServiceResponse();
  try {
    // validar que tenga permisos para eliminar
    const valid = await Community.findById(communityId);

    if (!valid) {
      throw new Error("No existe una Grupo con ese id");
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

    response.setSucessResponse(
      "Usuario ha salido del grupo Correctamente",
      comunidad
    );
  } catch (error) {
    response.setErrorResponse(error.message, 500);
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
};
