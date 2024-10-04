const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/database');

const sequelize = new Sequelize(
    config.development.database,
    config.development.username,
    config.development.password,
    {
        host: config.development.host,
        dialect: config.development.dialect,
    }
);

const db = {};

// Exportando a instância do Sequelize
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Importando o modelo Attendance
db.Attendance = require('./Attendance')(sequelize, DataTypes);

// Exportando o objeto db
module.exports = db;
