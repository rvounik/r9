const { DataTypes } = require('sequelize');

module.exports = sequelize => {
    sequelize.define('genres', {
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
                len: [3, 256]
            }
        },
        description: {
            allowNull: true,
            type: DataTypes.TEXT,
            unique: false
        }
    });
};
