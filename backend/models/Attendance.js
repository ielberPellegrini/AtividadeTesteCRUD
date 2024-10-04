module.exports = (sequelize, DataTypes) => {
    const Attendance = sequelize.define('Attendance', {
        nomeCompleto: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        tipo: {
            type: DataTypes.ENUM('entrada', 'intervalo', 'saida'),
            allowNull: false,
        },
        data: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        hora: {
            type: DataTypes.TIME,
            allowNull: false,
        },
    });

    return Attendance;
};
