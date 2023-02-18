'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        // const password =  process.env.SEED_SUPERUSER_PASSWORD || 'defaultpassword';
        const password = null;

        return queryInterface.bulkInsert('users', [
            {
                id: 1,
                email: 'rvo@rvo.rvo',
                password: '123',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    }
};
