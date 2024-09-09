'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TownWeatherInfos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      TownId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Towns',
          key: 'id'
        }
      },
      Temp: {
        type: Sequelize.INTEGER
      },
      MinTemp: {
        type: Sequelize.INTEGER
      },
      WeatherIcon: {
        type: Sequelize.STRING
      },
      WindSpeed: {
        type: Sequelize.STRING
      },
      DayName:{
        type: Sequelize.STRING
      },
      DayNumber: {
        type: Sequelize.INTEGER
      },
      MonthName: {
        type: Sequelize.STRING
      },
      Humidity: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('TownWeatherInfos');
  }
};