const { Sequelize } = require("sequelize");

const sequelize = require("../util/database");

const Address = sequelize.define("address", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  phone: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  address: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  city: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  type: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
});

module.exports = Address;
