'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Ponto extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    }

    Ponto.init({
        nomeCompleto: {
        type: DataTypes.STRING,
        allowNull: false
        },
    hora: {
        type: DataTypes.TIME,
        allowNull: false
    },
    data: {
        type: DataTypes.DATE,
        allowNull: false
    },
    tipo: {
        type: DataTypes.ENUM('Entrada', 'Intervalo', 'Saida'),
        allowNull: false
    }
    }, {
    sequelize,
    modelName: 'Ponto',
    });

    return Ponto;
};
