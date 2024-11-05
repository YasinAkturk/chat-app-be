const router = require("express").Router();
const { me, getAllUser, addFriendByEmail, getAllFriend } = require("./controller");
const { tokenCheck, verifyUserStatus } = require("../../middlewares/auth");

router.get("/me", tokenCheck, verifyUserStatus, me);
router.get("/getAllUser", tokenCheck, verifyUserStatus, getAllUser);
router.post("/add-friend", tokenCheck, verifyUserStatus, addFriendByEmail);
router.get("/getAllFriend", tokenCheck, verifyUserStatus, getAllFriend);

module.exports = router;
