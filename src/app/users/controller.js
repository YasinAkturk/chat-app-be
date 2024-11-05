const APIError = require("../../utils/errors");
const Response = require("../../utils/response");
const user = require("./model");

const userResponse = "_id name lastname email verified";

const me = async (req, res) => {
  return new Response(req.user).success(res);
};

const getAllUser = async (req, res) => {
  const allUser = await user.find({}).select(userResponse);
  return new Response(allUser).success(res);
};
const getAllFriend = async (req, res) => {
  try {
    const me = await user
      .findById(req.user._id)
      .populate("friends", "name lastname email") // Yalnızca belirli alanları al
      .exec();

    if (!me) {
      throw new APIError("Kullanıcı bulunamadı.", 404);
    }
    return new Response(me.friends, null).success(res);
  } catch (error) {
    throw new APIError(null, 500);
  }
};

const addFriendByEmail = async (req, res) => {
  const { friendEmail } = req.body;
  try {
    const friend = await user.findOne({ email: friendEmail });
    if (!friend) {
      throw new APIError("E-posta adresine sahip kullanıcı bulunamadı.", 500);
    }

    const me = await user.findById(req.user._id);
    if (me.friends.includes(friend._id)) {
      throw new APIError("Bu kullanıcı zaten arkadaş listenizde.", 500);
    }

    me.friends.push(friend._id);
    await me.save();
    return new Response(friend, "Arkadaş başarıyla eklendi").success(res);
  } catch (error) {
    throw new APIError("İşlem Başarısız", 400);
  }
};

module.exports = {
  me,
  getAllUser,
  addFriendByEmail,
  getAllFriend,
};
