const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Load the configuration file
const config = require(path.resolve(__dirname, 'config/config.js'));

// Extract the development configuration
const dbConfig = config.development;

// Create a Sequelize instance with the specified configuration
const sequelize = new Sequelize({
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database, // Connect directly to the specified database
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    dialectModule: require('tedious'), // Use 'tedious' for MSSQL
    dialectOptions: {
        trustServerCertificate: true // Equivalent to TrustServerCertificate=True
    }
});

// Authenticate the connection
sequelize.authenticate()
    .then(() => {
        console.log('Connection to the database has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

// Initialize the `db` object to hold the models and the Sequelize instance
const db = {};


db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import the models and add them to the `db` object
// You can import additional models as needed
// db.reviews = require('./reviewModel.js')(sequelize, DataTypes);

// Sync the models with the database
db.sequelize.sync({ force: false })
    .then(() => {
        console.log('Database synchronized successfully.');
    });

module.exports = db;
