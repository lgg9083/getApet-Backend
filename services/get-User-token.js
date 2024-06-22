const jwt = require("jsonwebtoken");
const User = require("../models/User");

const getUserToken = async (token) => {
  if (!token) {
    res.status(401).json({ message: "Acesso negado" });
  }
  const decoded = jwt.decode(token, "TOKENINCREMENT");
  const id = decoded.id;

  const user = await User.findById(id);

  return user;
};

module.exports = getUserToken;
