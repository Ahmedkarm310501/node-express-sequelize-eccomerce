const { validationResult } = require("express-validator");
const path = require("path");
const fs = require("fs");

const Product = require("../models/product");
const Category = require("../models/category");
const User = require("../models/user");

exports.addProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(
      "Validation failed, entered data is incorrect in add product"
    );
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }
  const categoryId = await Category.findOne({
    where: { name: req.body.category },
  });
  try {
    const product = await Product.create({
      name: req.body.name,
      price: req.body.price,
      quantity: req.body.quantity,
      details: req.body.details,
      photo: req.file.path,
      category: req.body.category,
      categoryId: categoryId.id,
    });
    res
      .status(201)
      .json({ message: "Product created successfully", product: product });
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect");
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }
  try {
    const categoryId = await Category.findOne({
      where: { name: req.body.category_name },
    });
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }
    product.name = req.body.name;
    product.price = req.body.price;
    product.quantity = req.body.quantity;
    product.details = req.body.details;
    product.categoryId = categoryId.id;
    if (req.file) {
      delete_image(product.photo);
      product.photo = req.file.path;
    }
    const updatedProduct = await product.save();
    res.status(201).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }
    delete_image(product.photo);
    await product.destroy();
    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

const delete_image = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => {
    if (err) console.log(err);
  });
};
