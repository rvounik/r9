const { DataTypes } = require('sequelize');

module.exports = {
    up: async queryInterface => {
        await queryInterface.createTable('pages', {
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
                    len: [3, 256]
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
        await queryInterface.dropTable('pages');
    }
};
