const jwt = require("jsonwebtoken");
const user = require("../app/users/model");
const APIError = require("../utils/errors");

const generateToken = (payload, secretKey, expiresIn) => {
  return jwt.sign(payload, secretKey, {
    algorithm: "HS512",
    expiresIn,
  });
};

const createToken = async (user, res) => {
  const payload = {
    sub: user._id,
    name: user.name,
  };

  const accessToken = generateToken(
    payload,
    process.env.JWT_SECRET_KEY,
    process.env.JWT_EXPIRES_IN
  );
  const refreshToken = generateToken(
    payload,
    process.env.JWT_REFRESH_SECRET_KEY,
    process.env.JWT_EXPIRES_IN
  );
  return res.status(201).json({
    success: true,
    accessToken,
    refreshToken,
    data: user,
    message: "Başarılı",
  });
};
const verifyRefreshToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    if (!refreshToken) reject(new APIError("Geçersiz Token", 401));

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET_KEY,
      (err, decoded) => {
        console.log("🚀 ~ returnnewPromise ~ decoded:", decoded);
        if (err) reject(new APIError("Geçersiz Token", 401));
        resolve(decoded);
      }
    );
  });
};

const tokenCheck = async (req, res, next) => {
  const headerToken =
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ");
  console.log("🚀 ~ tokenCheck ~ headerToken:", headerToken);

  if (!headerToken) new APIError("Geçersiz Oturum Lütfen Oturum Açın", 401);

  const token = req.headers.authorization.split(" ")[1];

  await jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
    if (err) new APIError("Geçersiz Token", 401);

    const userInfo = await user
      .findById(decoded?.sub)
      .select("_id name lastname email verified");

    if (!userInfo) new APIError("Geçersiz Token", 401);

    req.user = userInfo;
    next();
  });
};

const createTemporaryToken = async (userId, email) => {
  const payload = {
    sub: userId,
    email,
  };

  const token = generateToken(
    payload,
    process.env.JWT_TEMPORARY_KEY,
    process.env.JWT_TEMPORARY_EXPIRES_IN
  );
  return "Bearer " + token;
};

const decodedTemporaryToken = async (temporaryToken) => {
  const token = temporaryToken.split(" ")[1];
  let userInfo;
  await jwt.verify(
    token,
    process.env.JWT_TEMPORARY_KEY,
    async (err, decoded) => {
      if (err) throw new APIError("Geçersiz Token", 401);

      userInfo = await user
        .findById(decoded.sub)
        .select("_id name lastname email mailCode");
      if (!userInfo) throw new APIError("Geçersiz Token", 401);
    }
  );

  return userInfo;
};

// Kullanıcı doğrulama durumu kontrolü
const verifyUserStatus = (req, res, next) => {
  if (!req.user.verified) {
    return next(
      new APIError(
        "Hesabınız doğrulanmamış. Lütfen hesabınızı doğrulayın.",
        403
      )
    );
  }
  next();
};

module.exports = {
  createToken,
  tokenCheck,
  createTemporaryToken,
  decodedTemporaryToken,
  verifyUserStatus,
  verifyRefreshToken,
  generateToken,
};
