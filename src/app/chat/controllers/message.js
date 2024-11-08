const APIError = require("../../../utils/errors");
const Response = require("../../../utils/response");
const Message = require("../models/message");
const userResponse = "_id name lastname email";

const getMessageToday = async (req, res) => {
  try {
    /* const message = new Message({ sender:"66b08c2dad5d2b58b7562847", receiver:"66b31f3d95e1da0966d33bd9", content:"Hello" });
    await message.save(); */
    // Bugünün başlangıç ve bitiş zamanlarını belirleme
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Mesajları bu zaman aralığına göre sorgulama
    const messages = await Message.find({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .populate("sender", userResponse)
      .populate("receiver", userResponse)
      .exec();

    return new Response(messages, "İşlem Başarılı").created(res);
  } catch (err) {
    throw new APIError("Beklenmedik bir hata ile karşılaşıldı.", 500);
  }
};

const getMessages = async (req, res) => {
  const { receiverId } = req.body;

  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: receiverId },
        { sender: receiverId, receiver: req.user._id },
      ],
    }).sort({ createdAt: 1 }); // Mesajları oluşturulma tarihine göre sırala

    return new Response(messages, "İşlem Başarılı").created(res);
  } catch (error) {
    console.log("🚀 ~ getMessages ~ error:", error);
    throw new APIError("Mesajlar Alınamadı.", 500);
  }
};

module.exports = {
  getMessageToday,
  getMessages
};
