'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        // const password =  process.env.SEED_SUPERUSER_PASSWORD || 'defaultpassword';
        const password = null;

        return queryInterface.bulkInsert('pages', [
            {
                id: 1,
                slug: 'about-me',
                title: 'About me',
                description: 'This is the About Me page',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    }
};
