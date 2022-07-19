const router = require("express").Router();
const adminController = require("../controllers/adminController");
const isAuthAdmin = require("../middleware/is-auth-admin");
const Category = require("../models/category");
const { check } = require("express-validator");

router.post(
  "/add-product",
  isAuthAdmin,
  [
    check("name", "name more than 2 char").trim().isLength({ min: 2, max: 50 }),
    check("details", "Title is required")
      .trim()
      .isLength({ min: 20, max: 500 }),

    check("price", "Price must be between 50 and 50000").isFloat({
      min: 50,
      max: 50000,
    }),
    check("quantity", "quantity must be between 10 and 5000").isInt({
      min: 10,
      max: 5000,
    }),
    check("photo", "Photo is required").custom((value, { req }) => {
      if (req.file) {
        return true;
      }
      return false;
    }),
    check("category", "Category is required").custom(async (value) => {
      const category = await Category.findOne({ where: { name: value } });
      if (category) {
        return true;
      }
      return false;
    }),
  ],
  adminController.addProduct
);

router.put(
  "/update-product/:id",
  isAuthAdmin,
  [
    check("name", "name more than 2 char").trim().isLength({ min: 2, max: 50 }),
    check("details", "Title is required")
      .trim()
      .isLength({ min: 20, max: 500 }),
    check("price", "Price must be between 50 and 50000").isFloat({
      min: 50,
      max: 50000,
    }),
    check("quantity", "quantity must be between 10 and 5000").isInt({
      min: 10,
      max: 5000,
    }),
    check("category_name", "Category is required").custom(async (value) => {
      const category = await Category.findOne({ where: { name: value } });
      if (category) {
        return true;
      }
      return false;
    }),
  ],
  adminController.updateProduct
);

router.delete(
  "/delete-product/:id",
  isAuthAdmin,
  adminController.deleteProduct
);
//////////////////////////////////////////////////////////////////////////////////////////////
router.post("/add-user", isAuthAdmin, adminController.addUser);
router.get("/get-all-users", isAuthAdmin, adminController.getAllUsers);
router.get("/get-user/:userId", isAuthAdmin, adminController.getUser);
router.put("/update-user/:userId", isAuthAdmin, adminController.updateUser);
//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
router.get("/orders", isAuthAdmin, adminController.getAllOrders);
router.put(
  "/confirm-order/:orderId",
  isAuthAdmin,
  adminController.confirmOrder
);
//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
router.get("/dashboard", isAuthAdmin, adminController.dashboard);

router;

module.exports = router;
