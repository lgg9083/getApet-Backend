const jwt = require("jsonwebtoken");
const getToken = require("./get-token");

const verifytoken = (req, res, next) => {
  if (!req.headers.authorization) {
    res.status(401).json({ message: "Acesso Negado 1" });
    return;
  }
  const token = getToken(req);
  if (!token) {
    res.status(401).json({ message: "Acesso Negado 2" });
    return;
  }
  try {
    const verified = jwt.verify(token, "TOKENINCREMENT");
    req.user = verified;
    next();
  } catch (err) {
    return res.status(400).json({ message: "token invalido" });
  }
};
module.exports = verifytoken;
