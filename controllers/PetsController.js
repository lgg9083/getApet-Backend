const Pet = require("../models/Pet");
const getToken = require("../services/get-token");
const getUserToken = require("../services/get-User-token");
const objectId = require("mongoose").Types.ObjectId;
module.exports = class PetsController {
  static async create(req, res) {
    const { name, age, color, weight } = req.body;
    const available = true;
    const images = req.files;
    console.log(images);
    if (!name) {
      res.status(422).json({ message: "O nome é obrigátorio" });
      return;
    }
    if (!age) {
      res.status(422).json({ message: "a idade é obrigátorio" });
      return;
    }
    if (!color) {
      res.status(422).json({ message: "A cor é obrigátorio" });
      return;
    }
    if (!weight) {
      res.status(422).json({ message: "O tamanho é obrigátorio" });
      return;
    }
    if (!images) {
      res.status(422).json({ message: "O Imagem é obrigátorio" });
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
  static async getAll(req, res) {
    const pets = await Pet.find().sort("-createdAt");

    return res.status(200).json({
      pets: pets,
    });
  }
  static async getAllByUser(req, res) {
    const token = getToken(req);
    const user = await getUserToken(token);
    const pets = await Pet.find({ "user._id": user._id }).sort("-createdAt");

    res.status(200).json({
      pets: pets,
    });
  }
  static async getAllUserAdpoter(req, res) {
    const token = getToken(req);
    const userPet = getUserToken(token);
    console.log(userPet);
    const pets = await Pet.find({ "adpoter._id": userPet.user }).sort(
      "-createdAt"
    );
    console.log(pets);
    res.status(200).json({
      pets: pets,
    });
  }
  static async getPetById(req, res) {
    const id = req.params.id;

    if (!objectId.isValid(id)) {
      res.status(422).json({
        message: "O id informado não é valido",
      });
      return;
    }
    const pet = await Pet.findOne({ _id: id });

    if (!pet) {
      res.status(404).json({
        message: "Pet não encontrado",
      });
      return;
    }

    res.status(200).json({
      pet: pet,
    });
  }
  static async removePetByID(req, res) {
    console.log("aqui");
    const id = req.params.id;
    console.log(id);
    if (!objectId.isValid(id)) {
      res.status(422).json({
        message: "O id informado não é valido",
      });
      return;
    }
    const pet = await Pet.findOne({ _id: id });
    if (!pet) {
      res.status(404).json({
        message: "Pet não encontrado",
      });
      return;
    }

    const token = getToken(req);
    const user = await getUserToken(token);
    if (pet.user._id.toString() !== user._id.toString()) {
      res.status(422).json({
        message:
          "Um erro aconteceu ao tentar processar a sua solicitação, tente novamente mais tarde!",
      });
      return;
    }

    await Pet.findByIdAndDelete(id);

    res.status(200).json({ message: "Pet removido com sucesso" });
  }

  static async uptdatedPet(req, res) {
    const id = req.params.id;
    const { name, age, color, weight, available } = req.body;

    const images = req.files;
    const updatedPet = {};

    if (!objectId.isValid(id)) {
      res.status(422).json({
        message: "O id informado não é valido",
      });
      return;
    }
    const pet = await Pet.findOne({ _id: id });

    if (!pet) {
      res.status(404).json({
        message: "Pet não encontrado",
      });
      return;
    }
    const token = getToken(req);
    const user = await getUserToken(token);

    if (pet.user._id.toString() !== user._id.toString()) {
      res.status(422).json({
        message:
          "Um erro aconteceu ao tentar processar a sua solicitação, tente novamente mais tarde!",
      });
      return;
    }

    if (!name) {
      res.status(200).json({ message: "O nome é obrigátorio" });
      return;
    } else {
      updatedPet.name = name;
    }
    if (!age) {
      res.status(200).json({ message: "a idade é obrigátorio" });
      return;
    } else {
      updatedPet.age = age;
    }
    if (!color) {
      res.status(200).json({ message: "A cor é obrigátorio" });
      return;
    } else {
      updatedPet.color = color;
    }
    if (!weight) {
      res.status(200).json({ message: "O tamanho é obrigátorio" });
      return;
    } else {
      updatedPet.weight = weight;
    }
    if (images.length > 0) {
      updatedPet.images = [];
      images.map((image) => {
        updatedPet.images.push(image);
      });
    }

    await Pet.findByIdAndUpdate(id);

    res.status(200).json({
      message: "Pet Atualizado com sucesso",
    });
  }
  static async schedule(req, res) {
    const id = req.params.id

    // check if pet exists
    const pet = await Pet.findOne({ _id: id })

    // check if user owns this pet
    const token = getToken(req)
    const user = await getUserToken(token)

    console.log(pet)

    if (pet.user._id.equals(user._id)) {
      res.status(422).json({
        message: 'Você não pode agendar uma visita com seu próprio Pet!',
      })
      return
    }

    // check if user has already adopted this pet
    if (pet.adopter) {
      if (pet.adopter._id.equals(user._id)) {
        res.status(422).json({
          message: 'Você já agendou uma visita para este Pet!',
        })
        return
      }
    }

    // add user to pet
    pet.adopter = {
      _id: user._id,
      name: user.name,
      image: user.image,
    }

    console.log(pet)

    await Pet.findByIdAndUpdate(pet._id, pet)

    res.status(200).json({
      message: `A visita foi agendada com sucesso, entre em contato com ${pet.user.name} no telefone: ${pet.user.phone}`,
    })
  }

  static async confirmAdopterPet(req, res) {
    const id = req.params.id;
    const pet = await Pet.findOne({ _id: id });

    if (!pet) {
      res.status(404).json({
        message: "Pet não encontrado",
      });
      return;
    }
    const token = getToken(req);
    const user = await getUserToken(token);

    if (pet._id.toString() !== user._id.toString()) {
      res.status(422).json({
        message:
          "Um erro aconteceu ao tentar processar a sua solicitação, tente novamente mais tarde!",
      });
      return;
    }

    pet.available = false;

    await Pet.findByIdAndUpdate(id, pet);

    res.status(200).json({
      message: "Parábens o ciclo de adoção foi concluido com sucesso!",
    });
  }
};
