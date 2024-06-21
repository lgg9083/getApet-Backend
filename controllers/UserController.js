const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const createUserToken = require("../services/create-user-token");
const getToken = require("../services/get-token");
const getUserToken = require("../services/get-User-token");
module.exports = class UserController {
  static async register(req, res) {
    const { name, email, password, phone, confirmPassword } = req.body;
    if (!name) {
      res.status(422).json({ message: "O nome é obrigátorio!" });
      return;
    }
    if (!email) {
      res.status(422).json({ message: "O email é obrigátorio!" });
      return;
    }
    if (!password) {
      res.status(422).json({ message: "A senha é obrigátorio!" });
      return;
    }
    if (!phone) {
      res.status(422).json({ message: "O telefone é obrigátorio!" });
      return;
    }
    if (!confirmPassword) {
      res
        .status(422)
        .json({ message: "A confirmação de senha é obrigátorio!" });
      return;
    }
    if (password != confirmPassword) {
      res.status(422).json({
        message: "A senha e a confirmação de senha precisam ser iguais",
      });
      return;
    }
    const user = await User.findOne({ email: email });
    if (user) {
      res.status(422).json({
        message: "Esse email ja esta cadastrado, tente outro por favor!",
      });
      return;
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const users = new User({
      name,
      email,
      phone,
      password: passwordHash,
    });
    try {
      const newUser = await users.save();
      const token = await createUserToken(newUser, req, res);
      res.status(200).json({
        token,
      });
      return;
    } catch (err) {
      res.status(500).json({ message: "Algo deu Errado", err });
    }
  }
  static async login(req, res) {
    const { email, password } = req.body;
    console.log(email, password)
    if (!email) {
      res.status(422).json({ message: "O email é obrigátorio!" });
      return;
    }
    if (!password) {
      res.status(422).json({ message: "A senha é obrigátorio!" });
      return;
    }

    const user = await User.findOne({ email: email });

    if (!user) {
      res.status(422).json({
        message: "usuario não encontrado",
      });
      return;
    }
    console.log(password, user.password)
    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      res.status(422).json({
        message: "Senha invalida",
      });
    }
    await createUserToken(user, req, res);
  }

  static async checkUser(req, res) {
    let currentUser;

    if (req.headers.authorization) {
      const token = await getToken(req);
      const decoded = jwt.verify(token, "TOKENINCREMENT");
      console.log(decoded);
      currentUser = await User.findById(decoded.id);
      currentUser.password = undefined;
    } else {
      currentUser = null;
      res.status(401).json({ message: "Não autorizado" });
    }

    res.status(201).send(currentUser);
  }
  static async getUserById(req, res) {
    const id = req.params.id;

    const user = await User.findById(id).select("-password");

    if (!user) {
      res.status(422).json({ message: "usuario não encontrado" });
      return;
    }
    res.status(200).json({ user });
  }
  static async getUserByIdPost(req, res) {
    const id = req.params.id;
    const { name, password, email, phone, confirmPassword } = req.body;

    const token = await getToken(req);
    const user = await getUserToken(token);
    if (!name) {
      res.status(422).json({ message: "O nome é obrigátorio!" });
      return;
    }
    user.name = name;

    if (req.file) {
      user.imagem = req.file.filename;
    }
    if (!email) {
      res.status(422).json({ message: "O email é obrigátorio!" });
      return;
    }
    const existsEmail = await User.findOne({ email: email });

    if (user !== email && existsEmail) {
      res.status(422).json({ message: "esse email já existe!" });
      return;
    }
    user.email = email;

    if (!phone) {
      res.status(422).json({ message: "O telefone é obrigátorio!" });
      return;
    }
    user.phone = phone;
    if (!confirmPassword) {
      res
        .status(422)
        .json({ message: "A confirmação de senha é obrigátorio!" });
      return;
    }

    if (password != confirmPassword) {
      res.status(422).json({
        message: "A senha e a confirmação de senha precisam ser iguais",
      });
      return;
    } else if (password === confirmPassword && password != null) {
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);
      user.password = passwordHash;
    }
    try {
      await User.findByIdAndUpdate(
        { _id: user._id },
        { $set: user },
        { new: true }
      );
      res.status(200).json({ message: "Usuario atualizado com sucesso" });
    } catch (err) {
      res.status(500).json({ message: "erro ao atualizar usuario" });
    }
  }
};
