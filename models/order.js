const { Sequelize } = require("sequelize");

const sequelize = require("../util/database");

const Order = sequelize.define("order", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  totalPrice: {
    type: Sequelize.DOUBLE,
    allowNull: false,
  },
  status: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  deleviryType: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
  addressId: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Order;
