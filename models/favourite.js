const { Sequelize } = require("sequelize");
const sequelize = require("../util/database");

const Favourite = sequelize.define("favourite", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
});

module.exports = Favourite;
