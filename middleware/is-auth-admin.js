const jwt = require("jsonwebtoken");
const User = require("../models/user");

module.exports = async (req, res, next) => {
  const token = req.get("Authorization");
  try {
    const decodedToken = jwt.verify(token, "secret");
    if (!decodedToken) {
      const error = new Error("Not authenticated");
      error.statusCode = 401;
      throw error;
    }
    const user = await User.findByPk(decodedToken.userId);
    if (!user) {
      const error = new Error("User does not exist");
      error.statusCode = 404;
      throw error;
    }
    if(user.isAdmin === false){
        const error = new Error("Not authorized to access admin route");
        error.statusCode = 401;
        throw error;
    }
    req.userId = decodedToken.userId;
    req.user = user;
    next();
  } catch (err) {
    console.log(`in catch err middleware`);
    next(err);
  }
};
