const jwt = require("jsonwebtoken");
const User = require("../models/User");

const getUserToken = async (token) => {
  if (!token) {
    res.status(401).json({ message: "Acesso negado" });
  }
  const decoded = jwt.decode(token, "TOKENINCREMENT");
  const id = decoded.id;
  console.log(id);
  const user = await User.findById(id);
  console.log(user, 'user do ger')

  return user;
};

module.exports = getUserToken;
