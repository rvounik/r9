'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        // const password =  process.env.SEED_SUPERUSER_PASSWORD || 'defaultpassword';
        const password = null;

        return queryInterface.bulkInsert('platforms', [
            {
                id: 1,
                slug: 'nintendo-entertainment-system',
                title: 'Nintendo Entertainment System',
                description: 'This is about the NES console',
                manufacturer: 'Nintendo',
                introduced: '1984 (JAP)',
                technology: '6202 8bit cpu',
                generationId: 2,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 2,
                slug: 'sega-master-system',
                title: 'Sega Master System',
                description: 'This is about the Sega Master System console',
                manufacturer: 'Sega',
                introduced: '1984 (JAP)',
                technology: 'z80 8bit cpu',
                generationId: 2,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 3,
                slug: 'amiga',
                title: 'Amiga',
                description: 'This is about the Amiga platform',
                manufacturer: 'Commodore',
                introduced: '1985 (USA)',
                technology: '68000 16bit cpu',
                generationId: 3,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    }
};
