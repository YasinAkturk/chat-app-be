const user = require("../users/model");
const bcrypt = require("bcryptjs");
const Response = require("../../utils/response");
const APIError = require("../../utils/errors");
const {
  createToken,
  generateToken,
  createTemporaryToken,
  decodedTemporaryToken,
  verifyRefreshToken,
} = require("../../middlewares/auth");
const crypto = require("crypto");
const sendEmail = require("../../utils/sendMail");
const moment = require("moment");

// Sabit mesajlar
const ERROR_MESSAGES = {
  INVALID_EMAIL_PASSWORD: "Email yada Şifre Hatalıdır!",
  EMAIL_IN_USE: "Girmiş Olduğunuz Email Kullanımda!",
  USER_REGISTRATION_FAILED: "Kullanıcı Kayıt Edilemedi!",
  INVALID_USER: "Geçersiz Kullanıcı",
  INVALID_CODE: "Geçersiz Kod!",
  PASSWORD_RESET_SUCCESS: "Şifre Sıfırlama Başarılı",
  ACCOUNT_ACTIVATION_SUCCESS: "Hesabız Aktifleştirildi."
};

const SUCCESS_MESSAGES = {
  REGISTRATION_SUCCESS: "Kayıt Başarıyla Eklendi.",
  CHECK_EMAIL: "Lütfen Mail Kutunuzu Kontrol Ediniz",
  PASSWORD_RESET_AVAILABLE: "Şifre Sıfırlama Yapabilirsiniz"
};

// Ortak işlevler
const sendVerificationEmail = async (email, code, subject, text) => {
  await sendEmail({
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    text: `${text} ${code}`
  });
};

const generateVerificationCode = () => crypto.randomBytes(3).toString("hex");

const isCodeExpired = (expiryTime) => {
  const dbTime = moment(expiryTime);
  const nowTime = moment(new Date());
  return dbTime.diff(nowTime, "minutes") <= 0;
};

// Refresh Token ile access token oluşturma
const generateAccessToken = async (req, res) => {
  const { refreshToken } = req.body;
  verifyRefreshToken(refreshToken).then((data) => {
    const payload = {
      sub: data.sub,
      name: data.name,
    };
    const accessToken = generateToken(payload, process.env.JWT_SECRET_KEY, process.env.JWT_EXPIRES_IN);
    return new Response({ accessToken }).created(res);
  })
};

// Giriş yapma işlemi
const login = async (req, res) => {
  const { email, password } = req.body;

  const userInfo = await user.findOne({ email });
  if (!userInfo || !(await bcrypt.compare(password, userInfo.password))) {
    throw new APIError(ERROR_MESSAGES.INVALID_EMAIL_PASSWORD, 401);
  }

  createToken(userInfo, res);
};

// Kayıt işlemi
const register = async (req, res) => {
  const { email, password } = req.body;

  if (await user.findOne({ email })) {
    throw new APIError(ERROR_MESSAGES.EMAIL_IN_USE, 401);
  }

  req.body.password = await bcrypt.hash(password, 10);
  const userSave = new user(req.body);
  const verifiedCode = generateVerificationCode();

  await sendVerificationEmail(
    email,
    verifiedCode,
    "Hesabınızı Doğrulayın",
    "Hesap doğrulama kodunuz: "
  );

  try {
    await userSave.save();
    await user.updateOne(
      { email },
      {
        mailCode: {
          code: verifiedCode,
          time: moment().add(1, "hour").format("YYYY-MM-DD HH:mm:ss")
        }
      }
    );
    return new Response(null, SUCCESS_MESSAGES.REGISTRATION_SUCCESS).created(res);
  } catch (error) {
    throw new APIError(ERROR_MESSAGES.USER_REGISTRATION_FAILED, 400);
  }
};

// Şifremi unuttum işlemi
const forgetPassword = async (req, res) => {
  const { email } = req.body;

  const userInfo = await user.findOne({ email }).select("name lastname email");
  if (!userInfo) return new APIError(ERROR_MESSAGES.INVALID_USER, 400);

  const resetCode = generateVerificationCode();
  await sendVerificationEmail(
    userInfo.email,
    resetCode,
    "Şifre Sıfırlama",
    "Şifre Sıfırlama Kodunuz"
  );

  await user.updateOne(
    { email },
    {
      mailCode: {
        code: resetCode,
        time: moment().add(15, "minute").format("YYYY-MM-DD HH:mm:ss")
      }
    }
  );

  return new Response(true, SUCCESS_MESSAGES.CHECK_EMAIL).success(res);
};

// Şifre sıfırlama kodu kontrolü
const resetCodeCheck = async (req, res) => {
  const { email, code } = req.body;

  const userInfo = await user.findOne({ email }).select("_id name lastname email mailCode");
  if (!userInfo || isCodeExpired(userInfo.mailCode.time) || userInfo.mailCode.code !== code) {
    throw new APIError(ERROR_MESSAGES.INVALID_CODE, 401);
  }

  const temporaryToken = await createTemporaryToken(userInfo._id, userInfo.email);
  return new Response({ temporaryToken }, SUCCESS_MESSAGES.PASSWORD_RESET_AVAILABLE).success(res);
};

// Şifre sıfırlama işlemi
const resetPassword = async (req, res) => {
  const { password, temporaryToken } = req.body;

  const decodedToken = await decodedTemporaryToken(temporaryToken);
  const hashPassword = await bcrypt.hash(password, 10);

  await user.findByIdAndUpdate(
    { _id: decodedToken._id },
    {
      mailCode: { code: null, time: null },
      password: hashPassword
    }
  );

  return new Response(decodedToken, ERROR_MESSAGES.PASSWORD_RESET_SUCCESS).success(res);
};

// Hesap etkinleştirme işlemi
const activateAccount = async (req, res) => {
  const { code } = req.body;
  const { email } = req.user;

  const userInfo = await user.findOne({ email }).select("_id name lastname email mailCode");
  if (!userInfo || isCodeExpired(userInfo.mailCode.time) || userInfo.mailCode.code != code) {
    throw new APIError(ERROR_MESSAGES.INVALID_CODE, 401);
  }

  await user.findByIdAndUpdate(
    { _id: userInfo._id },
    {
      mailCode: { code: null, time: null },
      verified: true
    }
  );

  return new Response(null, ERROR_MESSAGES.ACCOUNT_ACTIVATION_SUCCESS).success(res);
};

module.exports = {
  login,
  register,
  forgetPassword,
  resetCodeCheck,
  resetPassword,
  activateAccount,
  generateAccessToken
};
