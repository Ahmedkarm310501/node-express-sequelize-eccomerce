const router = require("express").Router();

const shopController = require("../controllers/shopController");

router.get("/categories", shopController.getCategories);
router.get("/products", shopController.getProducts);
router.get("/product/:id", shopController.getProduct);

module.exports = router;
