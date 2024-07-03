const router = require("express").Router();
const verifyToken = require("../services/verify-token");
const PetsContoller = require("../controllers/PetsController");
const { imageUpload } = require("../services/images-uploads");
const PetsController = require("../controllers/PetsController");

router.post(
  "/create",
  verifyToken,
  imageUpload.array("images"),
  PetsContoller.create
);
router.get("/", PetsContoller.getAll);
router.get("/mypets", verifyToken, PetsContoller.getAllByUser);
router.get("/myadpotions", verifyToken, PetsContoller.getAllUserAdpoter);
router.get("/:id", PetsContoller.getPetById);
router.delete("/:id", verifyToken, PetsContoller.removePetByID);
router.patch(
  "/:id",
  verifyToken,
  imageUpload.array("images"),
  PetsController.uptdatedPet
);
router.patch("/schedule/:id", verifyToken, PetsContoller.schedule);
router.patch("/concludes/:id", verifyToken, PetsContoller.confirmAdopterPet);
module.exports = router;
