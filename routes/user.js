const router = require("express").Router();
const userController = require("../controllers/userController");
const isAuth = require("../middleware/is-auth");
const { check } = require("express-validator");
const Product = require("../models/product");

// --------------------- user profile routes ---------------------------

router.get("/profile", isAuth, userController.getProfile);
router.put(
  "/update-profile",
  isAuth,
  [
    check("name", "Name is required").trim().not().isEmpty(),
    check("dateOfBirth", "Date of birth is required"),
  ],
  userController.updateProfile
);
router.put(
  "/update-password",
  isAuth,
  [
    check("oldPassword", "Old password is required").trim().not().isEmpty(),
    check("newPassword", "New password is required").trim().not().isEmpty(),
  ],
  userController.updatePassword
);

// --------------------- user profile routes ---------------------------

// ----------------------address routes----------------------------
router.post("/add-address", isAuth, userController.addAddress);
router.get("/get-addresses", isAuth, userController.getAddresses);
router.delete(
  "/delete-address/:addressId",
  isAuth,
  userController.deleteAddress
);
// ----------------------end address routes----------------------------

// ----------------------cart routes----------------------------

router.post(
  "/add-to-cart",
  isAuth,
  check("productId", "product dose not exist").custom(async (value) => {
    const product = await Product.findByPk(value);
    if (product) {
      return true;
    }
    return false;
  }),
  userController.addToCart
);
router.get("/get-cart-items", isAuth, userController.getCartItems);
router.delete(
  "/remove-from-cart-one/:productId",
  isAuth,
  userController.deleteCartItem
);
router.delete(
  "/remove-from-cart-all/:productId",
  isAuth,
  userController.deleteCartItems
);

// ----------------------end cart routes----------------------------

// ----------------------favourites routes----------------------------

router.post(
  "/add-to-favourites",
  isAuth,
  [
    check("productId", "product dose not exist").custom(async (value) => {
      const product = await Product.findByPk(value);
      if (product) {
        return true;
      }
      return false;
    }),
  ],
  userController.addToFavourites
);
router.get("/get-favourite-items", isAuth, userController.getFavourites);
router.delete(
  "/remove-from-favourites",
  isAuth,
  [
    check("productId", "product dose not exist").custom(async (value) => {
      const product = await Product.findByPk(value);
      if (product) {
        return true;
      }
      return false;
    }),
  ],
  userController.deleteFavoriteItem
);

// ----------------------end favourites routes----------------------------

// ----------------------- order routes ----------------------------------

router.post("/add-order", isAuth, userController.addOrder);
router.get("/check-out", isAuth, userController.getCheckOut);
router.get("/get-orders", isAuth, userController.getOrders);

// ----------------------- end order routes ----------------------------------

module.exports = router;
