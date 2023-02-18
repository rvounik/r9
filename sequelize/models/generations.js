const { DataTypes } = require('sequelize');

module.exports = sequelize => {
    sequelize.define('generations', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        slug: {
            allowNull: false,
            type: DataTypes.STRING,
            unique: true,
            validate: {
                len: [1, 256]
            }
        },
        title: {
            allowNull: false,
            type: DataTypes.STRING,
            unique: true,
            validate: {
                len: [1, 256]
            }
        },
        description: {
            allowNull: true,
            type: DataTypes.TEXT,
            unique: false
        },
        yearStart: {
            allowNull: true,
            type: DataTypes.INTEGER,
            unique: false
        },
        yearEnd: {
            allowNull: true,
            type: DataTypes.INTEGER,
            unique: false
        },
    });
};
