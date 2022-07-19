const router = require("express").Router();
const authController = require("../controllers/authController");

router.post("/register", authController.postRegister);
router.post("/login", authController.postLogin);

module.exports = router;
