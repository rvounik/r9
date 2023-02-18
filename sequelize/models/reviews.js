const { DataTypes } = require('sequelize');

module.exports = sequelize => {
    sequelize.define('reviews', {
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
        score: {
            allowNull: true,
            type: DataTypes.INTEGER,
            unique: false,
            validate: {
                len: [1, 3]
            }
        },
        released: {
            allowNull: true,
            type: DataTypes.STRING,
            unique: false,
            validate: {
                len: [1, 256]
            }
        },
        genreId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'genres',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL' /* state what happens when the foreign key is deleted */
        },
        platformId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'platforms',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL' /* state what happens when the foreign key is deleted */
        },
        description: {
            allowNull: true,
            type: DataTypes.TEXT,
            unique: false
        }
    });
};
