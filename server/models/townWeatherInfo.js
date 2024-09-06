'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class townWeatherInfo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
       this.belongsTo(models.Town, { foreignKey: 'TownId', as: 'Towns' })
    }
  }
  townWeatherInfo.init({
    TownId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Towns',
        key: 'id'
      }
    },
    Temp: DataTypes.STRING,
    MaxTemp: DataTypes.STRING,
    MinTemp: DataTypes.STRING,
    WeatherIcon: DataTypes.STRING,
    WindSpeed: DataTypes.STRING,
    ForecastDate: DataTypes.STRING
  }, {
    timestamps: true,
    sequelize,
    modelName: 'TownWeatherInfo',
  });
  return townWeatherInfo;
};