const jwt = require("jsonwebtoken");

const createUserToken = async (user, req, res) => {
  const token = jwt.sign(
    {
      name: user.name,
      id: user._id,
    },
    "TOKENINCREMENT"
  );

  return res
    .status(200)
    .json({ message: "autenticação realaizada com sucesso", token });
};

module.exports = createUserToken;
