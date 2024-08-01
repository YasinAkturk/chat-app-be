const router = require("express").Router();
const { me, getAllUser } = require("./controller");
const { tokenCheck, verifyUserStatus } = require("../../middlewares/auth");

router.get("/me", tokenCheck, verifyUserStatus, me);
router.get("/getAllUser", tokenCheck, verifyUserStatus, getAllUser);

module.exports = router;
