const { DataTypes } = require('sequelize');

module.exports = {
    up: async queryInterface => {
        await queryInterface.createTable('platforms', {
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
            manufacturer: {
                allowNull: true,
                type: DataTypes.STRING,
                unique: false,
                validate: {
                    len: [1, 256]
                }
            },
            introduced: {
                allowNull: true,
                type: DataTypes.STRING,
                unique: false,
                validate: {
                    len: [1, 256]
                }
            },
            technology: {
                allowNull: true,
                type: DataTypes.STRING,
                unique: false,
                validate: {
                    len: [1, 256]
                }
            },
            generationId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'generations',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL' /* state what happens when the foreign key is deleted */
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
        await queryInterface.dropTable('platforms');
    }
};
