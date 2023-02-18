require('dotenv').config();
const app = require('./express/app');
const sequelize = require('./sequelize');

const PORT = 8010;

async function assertDatabaseConnectionOk() {
    try {
        await sequelize.authenticate();
    } catch (error) {
        console.log('Unable to connect to the database:');
        console.log(error.message);
        process.exit(1);
    }
}

async function init() {
    await assertDatabaseConnectionOk();

    app.listen(PORT, () => {
        console.log(`Express server started on port ${PORT}.`);
    });
}

init();
