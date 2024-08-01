const router = require("express").Router();
const {
  login,
  register,
  forgetPassword,
  resetCodeCheck,
  resetPassword,
  activateAccount,
} = require("./controller");
const authValidation = require("../../middlewares/validations/auth.validation");
const { tokenCheck } = require("../../middlewares/auth");

router.post("/login", authValidation.login, login);

router.post("/register", authValidation.register, register);

router.post("/forget-password", forgetPassword);

router.post("/reset-code-check", resetCodeCheck);

router.post("/reset-password", resetPassword);

router.post("/activate-account", tokenCheck, activateAccount);

module.exports = router;
