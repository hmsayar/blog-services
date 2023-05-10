const jwt = require("jsonwebtoken");
const fs = require("fs");

const path = require("path");

// const publicKeyPath = path.resolve(__dirname, "./keys/public-key.pem");
// const publicKey = fs.readFileSync(publicKeyPath, "utf8");

const tokenMiddleware = (publicKey) => (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
  const token = authHeader.split(' ')[1];
  jwt.verify(
    token,
    publicKey,
    (err, decoded) => {
      if (err) return res.sendStatus(401);
      req.user = decoded.UserInfo.username;
      req.roles = decoded.UserInfo.roles;
      req.id = decoded.UserInfo.userId;
      next();
    }
  );
};

module.exports = tokenMiddleware;