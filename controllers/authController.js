const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.postRegister = async (req, res, next) => {
  const { name, email, password, dateOfBirth } = req.body;

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
    });
    await newUser.createCart({});
    await newUser.createFavourite({});
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    throw err;
  }
};

exports.postLogin = async (req, res, next) => {
  const { name, password } = req.body;
  try {
    const user = await User.findOne({ where: { name: name } });
    if (!user) {
      const error = new Error("User does not exist");
      error.statusCode = 404;
      throw error;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign({ userId: user.id }, "secret", { expiresIn: "24h" });
    res.status(200).json({
      token: token,
      userName: user.name,
      isAdmin: user.isAdmin,
      status: user.status,
      session_time: "24h",
    });
  } catch (err) {
    next(err);
  }
};
