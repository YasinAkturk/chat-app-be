const Response = require("../../utils/response");
const user = require("./model");

const userResponse = "_id name lastname email verified"

const me = async (req, res) => {
  return new Response(req.user).success(res);
};

const getAllUser = async (req, res) => {
  const allUser = await user.find({}).select(userResponse);
  return new Response(allUser).success(res);
}

module.exports = {
  me,
  getAllUser
};
