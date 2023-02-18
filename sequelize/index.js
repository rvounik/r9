require('dotenv').config();
const { Sequelize } = require('sequelize');
const { applyExtraSetup } = require('./extra-setup');

const sequelize = new Sequelize(`mysql://${process.env.DB_USER}@${process.env.DB_HOST}/${process.env.DB_NAME}`, {
	dialect: 'mysql',
    define: {
        freezeTableName: true //prevent Sequelize from pluralizing table names
    }
});

const modelDefiners = [
	require('./models/genres.js'),
    require('./models/generations.js'),
    require('./models/pages.js'),
    require('./models/platforms.js'),
    require('./models/games.js'),
    require('./models/reviews.js'),
    require('./models/users.js')
];

// define all models according to their specifications
for (const modelDefiner of modelDefiners) {
	modelDefiner(sequelize);
}

// run extra setup (ie associations) after all the models are loaded
applyExtraSetup(sequelize);

// export the Sequelize connection instance to be used by the app
module.exports = sequelize;
