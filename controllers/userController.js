const User = require("../models/user");
const Address = require("../models/address");
const Product = require("../models/product");
const Order = require("../models/order");
const OrderItem = require("../models/order-item");
const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

const delete_image = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => {
    if (err) console.log(err);
  });
};

exports.getProfile = async (req, res, next) => {
  try {
    res.status(200).json({
      message: "User fetched successfully",
      user: {
        name: req.user.name,
        email: req.user.email,
        photo: req.user.photo,
        dateOfBirth: req.user.dateOfBirth,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Invalid data");
    error.statusCode = 422;
    return next(error);
  }
  try {
    req.user.name = req.body.name;
    req.user.dateOfBirth = req.body.dateOfBirth;
    if (req.file) {
      delete_image(req.user.photo);
      req.user.photo = req.file.path;
    }
    await req.user.save();
    res.status(200).json({
      message: "User updated successfully",
      user: {
        name: req.user.name,
        dateOfBirth: req.user.dateOfBirth,
        photo: req.user.photo,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.updatePassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Invalid data");
    error.statusCode = 422;
    return next(error);
  }
  try {
    const isPasswordValid = await bcrypt.compare(
      req.body.oldPassword,
      req.user.password
    );
    if (!isPasswordValid) {
      const error = new Error("Invalid old password");
      error.statusCode = 422;
      throw error;
    }
    const newPassword = await bcrypt.hash(req.body.newPassword, 12);
    await req.user.update({
      password: newPassword,
    });
    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.addAddress = async (req, res, next) => {
  const { name, city, address, phone, type } = req.body;
  try {
    const createdAddress = await req.user.createAddress({
      name: name,
      city: city,
      address: address,
      phone: phone,
      type: type,
    });
    res.status(201).json({
      message: "Address created successfully",
      address: createdAddress,
    });
  } catch (err) {
    next(err);
  }
};
exports.getAddresses = async (req, res, next) => {
  try {
    const addresses = await req.user.getAddresses();
    res.status(200).json({
      message: "Addresses fetched successfully",
      addresses: addresses,
    });
  } catch (err) {
    next(err);
  }
};
exports.deleteAddress = async (req, res, next) => {
  const addressId = req.params.addressId;
  try {
    const address = await Address.findByPk(addressId);
    if (!address) {
      const error = new Error("Address does not exist");
      error.statusCode = 404;
      throw error;
    }
    if (address.userId !== req.userId) {
      const error = new Error("You are not authorized to delete this address");
      error.statusCode = 401;
      throw error;
    }
    await address.destroy();
    res.status(200).json({
      message: "Address deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.addToCart = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Invalid product id");
    error.statusCode = 422;
    return next(error);
  }
  try {
    const userCart = await req.user.getCart();
    const product = await userCart.getProducts({
      where: { id: req.body.productId },
    });
    if (product.length > 0) {
      const updatedQuantity = product[0].cartItem.quantity + 1;
      await product[0].cartItem.update({
        quantity: updatedQuantity,
      });
      res.status(200).json({
        message: "product added to cart successfully",
        userCart: userCart,
        product: product,
      });
      return;
    }
    const newProduct = await Product.findByPk(req.body.productId);
    const cartItem = await userCart.addProduct(newProduct, {
      through: { quantity: 1 },
    });
    res.status(200).json({
      message: "Cart fetched successfully",
      cartItem: cartItem,
    });
  } catch (err) {
    next(err);
  }
};

exports.getCartItems = async (req, res, next) => {
  try {
    const userCart = await req.user.getCart();
    const products = await userCart.getProducts();
    let totalPrice = 0;
    products.forEach((product) => {
      totalPrice += product.price * product.cartItem.quantity;
    });

    res.status(200).json({
      message: "Cart fetched successfully",
      products: products,
      totalPrice: totalPrice,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteCartItem = async (req, res, next) => {
  try {
    const userCart = await req.user.getCart();
    const cartProduct = await userCart.getProducts({
      where: { id: req.params.productId },
    });
    if (cartProduct.length > 0) {
      if (cartProduct[0].cartItem.quantity > 1) {
        const updatedQuantity = cartProduct[0].cartItem.quantity - 1;
        await cartProduct[0].cartItem.update({
          quantity: updatedQuantity,
        });
        res.status(200).json({
          message: "product deleted from cart successfully",
        });
        return;
      } else {
        await cartProduct[0].cartItem.destroy();
        res.status(200).json({
          message: "product deleted from cart successfully",
        });
        return;
      }
    } else {
      const error = new Error("Cart item does not exist");
      error.statusCode = 404;
      throw error;
    }
  } catch (err) {
    next(err);
  }
};

exports.deleteCartItems = async (req, res, next) => {
  try {
    const userCart = await req.user.getCart();
    const product = await userCart.getProducts({
      where: { id: req.params.productId },
    });
    if (product.length > 0) {
      await product[0].cartItem.destroy();
      res.status(200).json({
        message: "Cart deleted successfully",
      });
    } else {
      const error = new Error("Cart item does not exist");
      error.statusCode = 404;
      throw error;
    }
  } catch (err) {
    next(err);
  }
};

exports.addToFavourites = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Invalid product id");
    error.statusCode = 404;
    return next(error);
  }
  try {
    const userFavourite = await req.user.getFavourite();
    const product = await userFavourite.getProducts({
      where: { id: req.body.productId },
    });
    if (product.length > 0) {
      res.status(200).json({
        message: "product already added to favourites",
      });
    } else {
      const newProduct = await Product.findByPk(req.body.productId);
      await userFavourite.addProduct(newProduct);
      res.status(201).json({
        message: "product added to favourites successfully",
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.getFavourites = async (req, res, next) => {
  try {
    const userFavourite = await req.user.getFavourite();
    const products = await userFavourite.getProducts();
    res.status(200).json({
      message: "Favourites fetched successfully",
      products: products,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteFavoriteItem = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Invalid product id");
    error.statusCode = 404;
    return next(error);
  }
  try {
    const userFavourite = await req.user.getFavourite();
    const product = await userFavourite.getProducts({
      where: { id: req.body.productId },
    });
    if (product.length > 0) {
      await product[0].destroy();
      res.status(200).json({
        message: "product deleted from favourites successfully",
      });
    } else {
      const error = new Error("Cart item does not exist");
      error.statusCode = 404;
      throw error;
    }
  } catch (err) {
    next(err);
  }
};

exports.getCheckOut = async (req, res, next) => {
  try {
    const userCart = await req.user.getCart();
    const products = await userCart.getProducts();
    let totalPrice = 0;
    products.forEach((product) => {
      totalPrice += product.price * product.cartItem.quantity;
    });
    const userAddresses = await req.user.getAddresses();
    res.status(200).json({
      message: "Cart fetched successfully",
      products: products,
      totalPrice: totalPrice,
      userAddresses: userAddresses,
    });
  } catch (err) {
    next(err);
  }
};

exports.addOrder = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Invalid product id");
    error.statusCode = 404;
    return next(error);
  }
  try {
    const userCart = await req.user.getCart();
    const products = await userCart.getProducts();
    let totalPrice = 0;
    products.forEach((product) => {
      totalPrice += product.price * product.cartItem.quantity;
    });
    if (req.body.deleviryType == 1) {
      totalPrice += 50;
    }
    const order = await req.user.createOrder({
      totalPrice: totalPrice,
      addressId: req.body.addressId,
      deleviryType: req.body.deleviryType,
    });
    products.forEach((product) => {
      order.addProduct(product, {
        through: {
          quantity: product.cartItem.quantity,
        },
      });
    });
    await userCart.setProducts(null);
    res.status(200).json({
      message: "Order placed successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const userOrders = await req.user.getOrders({
      include: ["products"],
    });
    let orders = [];
    for (const order of userOrders) {
      const productData = order.products.map((product) => {
        orders.push({
          orderId: order.id,
          productPhoto: product.photo,
          productName: product.name,
          productPrice: product.price * product.orderItem.quantity,
          productQuantity: product.orderItem.quantity,
          orderStatus: order.status,
        });
      });
    }

    res.status(200).json({
      message: "Orders fetched successfully",
      orders: orders,
    });
  } catch (err) {
    next(err);
  }
};
