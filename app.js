const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const sequelize = require("./util/database");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const Product = require("./models/product");
const User = require("./models/user");
const Address = require("./models/address");
const Category = require("./models/category");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");
const Favourite = require("./models/favourite");
const FavouriteItem = require("./models/favourite-item");
const Order = require("./models/order");
const OrderItem = require("./models/order-item");
const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("url is " + req.url);
    if (
      req.url === "/admin/add-product" ||
      req.url.startsWith("/admin/update-product")
    ) {
      cb(null, "images/products");
    } else if (req.url === "/user/update-profile") {
      cb(null, "data/users-images");
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("photo")
);
app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/data", express.static(path.join(__dirname, "data")));
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/admin", adminRoutes);
app.use("/shop", shopRoutes);

app.use((error, req, res, next) => {
  console.log(
    "======================================================================"
  );
  console.log(
    "======================================================================"
  );
  console.log("in error middleware .. ");
  console.log(
    "======================================================================"
  );
  console.log(
    "======================================================================"
  );
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message || "Internal server error";
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

User.hasMany(Address);
Address.belongsTo(User);
Category.hasMany(Product);
Product.belongsTo(Category);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
User.hasOne(Favourite);
Favourite.belongsTo(User);
Favourite.belongsToMany(Product, { through: FavouriteItem });
Product.belongsToMany(Favourite, { through: FavouriteItem });
User.hasMany(Order);
Order.belongsTo(User);
Order.belongsToMany(Product, { through: OrderItem });
Product.belongsToMany(Order, { through: OrderItem });

sequelize
  .sync()
  // .sync({ force: true })
  .then(() => {
    app.listen(8000);
    console.log("Database connected");
    console.log(
      "==========================================================================================================================="
    );
  })
  .catch((err) => {
    console.log(err);
  });
