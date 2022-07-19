const Sequelize = require("sequelize").Sequelize;

const sequelize = new Sequelize("e-ccomerce-back-end", "root", "", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

module.exports = sequelize;
