const APIError = require("../../utils/errors");
const Response = require("../../utils/response");
const message = require("../chat/models/message");
const user = require("./model");

const userResponse = "_id name lastname email verified";

const me = async (req, res) => {
  return new Response(req.user).success(res);
};

const getAllUser = async (req, res) => {
  const allUser = await user.find({}).select(userResponse);
  return new Response(allUser).success(res);
};
const getFriendsWithLastMessage = async (req, res) => {
  try {
    const me = await user
      .findById(req.user._id)
      .populate("friends", "name lastname email");

    console.log("🚀 ~ getFriendsWithLastMessage ~ me:", me);
    if (!me) {
      throw new APIError("Kullanıcı bulunamadı.", 404);
    }

    const friendsWithLastMessage = await Promise.all(
      me.friends.map(async (friend) => {
        console.log("🚀 ~ friendsWithLastMessage ~ friend:", friend);
        const lastMessage = await message
          .findOne({
            $or: [
              { sender: req.user._id, receiver: friend._id },
              { sender: friend._id, receiver: req.user._id },
            ],
          })
          .sort({ createdAt: -1 }); // En son mesajı almak için tarihe göre sıralıyoruz

        return {
          name: friend.name,
          lastname: friend.lastname,
          lastMessage: lastMessage ? lastMessage.content : null,
          lastMessageDate: lastMessage ? lastMessage.createdAt : null,
        };
      })
    );

    return new Response(friendsWithLastMessage, null).success(res);
  } catch (error) {
    throw new APIError("Arkadaşlar alınamadı", 500);
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
  getFriendsWithLastMessage,
};
