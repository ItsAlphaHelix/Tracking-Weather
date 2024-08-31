require('dotenv').config();

const config = {
  development: {
    username: process.env.name,
    password: process.env.password,
    database: "TrackingWeather",
    host: "http://localhost:8080/",
    dialect: "mssql"
  },
  test: {
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "mssql"
  },
  production: {
    username: "root",
    password: null,
    database: "database_production",
    host: "127.0.0.1",
    dialect: "mssql"
  }
};

module.exports = config;