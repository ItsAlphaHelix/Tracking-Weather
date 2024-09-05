'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Town extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    }
  }
  Town.init({
    Name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Lat: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Lon: {
      type: DataTypes.STRING,
      allowNull: false
    },
  }, {
    timestamps: true,
    sequelize,
    modelName: 'Town',
  });
  return Town;
};