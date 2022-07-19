const { validationResult } = require("express-validator");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const Product = require("../models/product");
const Category = require("../models/category");
const User = require("../models/user");
const Order = require("../models/order");

const delete_image = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => {
    if (err) console.log(err);
  });
};

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

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    const newUsers = users.map((user) => {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status == 0 ? "suspensed" : "active",
        photo: user.photo,
      };
    });
    res.status(200).json({
      message: "Users fetched successfully",
      users: newUsers,
    });
  } catch (err) {
    next(err);
  }
};

exports.addUser = async (req, res, next) => {
  console.log(req.body);
  const { name, email, password, dateOfBirth, isAdmin, status } = req.body;

  try {
    const user = await User.findOne({ where: { email: email } });
    if (user) {
      const error = new Error("User already exists");
      error.statusCode = 401;
      throw error;
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      email: email,
      name: name,
      password: hashedPassword,
      dateOfBirth: new Date(dateOfBirth),
      isAdmin: isAdmin,
      status: status,
    });
    await newUser.createCart({});
    await newUser.createFavourite({});
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    throw err;
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    user.password = undefined;
    res.status(200).json({
      message: "User fetched successfully",
      user: user,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  console.log(req.body);
  const { name, email, password, dateOfBirth, isAdmin, status } = req.body;
  console.log(name, email, password, dateOfBirth, isAdmin, status);
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    user.name = name;
    user.email = email;
    user.dateOfBirth = dateOfBirth;
    user.isAdmin = isAdmin;
    user.status = status;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      user.password = hashedPassword;
    }
    await user.save();
    res.status(200).json({
      message: "User updated successfully",
      user: user,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      include: [{ model: User }],
    });
    const newOrders = orders.map((order) => {
      return {
        id: order.id,
        userName: order.user.name,
        userEmail: order.user.email,
        userPhoto: order.user.photo,
        totalPrice: order.totalPrice,
        orderStatus: order.status,
      };
    });
    res.status(200).json({
      message: "Orders fetched successfully",
      orders: newOrders,
    });
  } catch (err) {
    next(err);
  }
};

exports.confirmOrder = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.orderId);
    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }
    order.status = true;
    await order.save();
    res.status(200).json({
      message: "Order confirmed successfully",
      order: order,
    });
  } catch (err) {
    next(err);
  }
};

exports.dashboard = async (req, res, next) => {
  try {
    const orders = await Order.findAll();
    let pendingPrice = 0;
    let confirmedPrice = 0;
    let totalPrice = 0;
    orders.forEach((order) => {
      if (order.status == false) pendingPrice += order.totalPrice;
      if (order.status == true) confirmedPrice += order.totalPrice;
      totalPrice += order.totalPrice;
    });

    const users = await User.findAll({
      order: [["id", "ASC"]], //
      limit: 2,
    });

    const lastOrders = await Order.findAll({
      order: [["id", "ASC"]],
      limit: 2,
      include: [{ model: User }],
    });

    res.status(200).json({
      message: "Dashboard fetched successfully",
      pendingPrice: pendingPrice,
      confirmedPrice: confirmedPrice,
      totalPrice: totalPrice,
      lastUsers: users,
      lastOrders: lastOrders,
    });
  } catch (err) {
    next(err);
  }
};
