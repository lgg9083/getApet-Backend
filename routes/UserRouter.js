const router = require("express").Router();
const { imageUpload } = require("../services/images-uploads");
const UserController = require("../controllers/UserController");
const verifyToken = require("../services/verify-token");

router.post("/login", UserController.login);
router.post("/register", UserController.register);
router.get("/checkUser", UserController.checkUser);
router.get("/:id", UserController.getUserById);
router.patch(
  "/edit/:id",
  verifyToken,
  imageUpload.single("image"),
  UserController.getUserByIdPost
);

module.exports = router;
