const router = require("express").Router();
const verifyToken = require("../services/verify-token");
const PetsContoller = require("../controllers/PetsController");
const { imageUpload } = require("../services/images-uploads");

router.post(
  "/create",
  verifyToken,
  imageUpload.array("images"),
  PetsContoller.create
);
router.get("/", PetsContoller.getAll)
router.get("/mypets", verifyToken, PetsContoller.getAllByUser)
module.exports = router;
