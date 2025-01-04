const User = require("../models/user.Model");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticate = async function (req, res, next) {
  try {
    const token = req.header(process.env.JWT_TOKEN_HEADER);
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    const tokenWithoutBearer = token.split(" ")[1];
    const tokenData = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET_KEY);
    const user = await User.findOne({ where: { email: tokenData.email } });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const authorize = function (...roleNames) {
  return function (req, res, next) {
    if (req.user && roleNames.includes(req.user.role)) {
      return next();
    }
    return res.status(401).json({ message: "user is not authorized" });
  };
};


module.exports = {
  authenticate,
  authorize,
};
