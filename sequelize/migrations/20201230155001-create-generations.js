const { DataTypes } = require('sequelize');

module.exports = {
    up: async queryInterface => {
        await queryInterface.createTable('generations', {
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
            createdAt: {
                allowNull: false,
                type: DataTypes.DATE
            },
            updatedAt: {
                allowNull: false,
                type: DataTypes.DATE
            }
        });
    },
    down: async queryInterface => {
        await queryInterface.dropTable('generations');
    }
};
