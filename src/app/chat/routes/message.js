const { tokenCheck, verifyUserStatus } = require("../../../middlewares/auth");
const { getMessageToday, getMessages } = require("../controllers/message");

const router = require("express").Router();

router.get("/today", tokenCheck, verifyUserStatus, getMessageToday);
router.get("/getMessages", tokenCheck, verifyUserStatus, getMessages);

module.exports = router;