const Pet = require("../models/Pet");
const getToken = require("../services/get-token");
const getUserToken = require("../services/get-User-token");

module.exports = class PetsController {
  static async create(req, res) {
    const { name, age, color, weight } = req.body;

    const available = true;
    const images = req.files;
    if (!name) {
      res.status(200).json({ message: "O nome é obrigátorio" });
      return;
    }
    if (!age) {
      res.status(200).json({ message: "a idade é obrigátorio" });
      return;
    }
    if (!color) {
      res.status(200).json({ message: "A cor é obrigátorio" });
      return;
    }
    if (!weight) {
      res.status(200).json({ message: "O tamanho é obrigátorio" });
      return;
    }
    if (!images) {
      res.status(200).json({ message: "O Imagem é obrigátorio" });
      return;
    }

    const token = getToken(req);
    const user = await getUserToken(token);

    const pet = new Pet({
      name,
      age,
      color,
      weight,
      available,
      images: [],
      user: {
        _id: user._id,
        name: user.name,
        imagem: user.imagem,
        phone: user.phone,
      },
    });
    images.map((image) => {
      pet.images.push(image.filename);
    });
    try {
      const newPet = await pet.save();
      res.status(200).json({ message: "Pet salvo com sucesso!" });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
};
