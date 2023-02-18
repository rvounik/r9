const { DataTypes } = require('sequelize');

module.exports = {
    up: async queryInterface => {
        await queryInterface.createTable('users', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            email: {
                allowNull: false,
                type: DataTypes.STRING,
                unique: true,
                validate: {
                    len: [1, 256]
                }
            },
            password: {
                allowNull: false,
                type: DataTypes.STRING,
                unique: true,
                validate: {
                    len: [1, 256]
                }
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
        await queryInterface.dropTable('users');
    }
};
