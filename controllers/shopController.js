const Category = require("../models/category");
const Product = require("../models/product");

exports.getCategories = async (req, res, next) => {
  const categories = await Category.findAll();
  const category_names = categories.map((category) => category.name);
  res.status(200).json({
    category_names: category_names,
  });
};

exports.getProducts = async (req, res, next) => {
  const products = await Product.findAll();
  res.status(200).json({
    products: products,
  });
};

exports.getProduct = async (req, res, next) => {
  const product = await Product.findOne({
    where: { id: req.params.id },
    include: "category",
  });
  res.status(200).json({
    product: product,
  });
};
