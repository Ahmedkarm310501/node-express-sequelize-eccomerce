const { Sequelize } = require("sequelize");
const sequelize = require("../util/database");

const FavouriteItem = sequelize.define("FavouriteItem", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
});

module.exports = FavouriteItem;
