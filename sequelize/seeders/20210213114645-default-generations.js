'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        // const password =  process.env.SEED_SUPERUSER_PASSWORD || 'defaultpassword';
        const password = null;

        return queryInterface.bulkInsert('generations', [
            {
                id: 1,
                slug: 'first',
                title: 'First generation',
                description: 'This was the first generation of video game consoles',
                yearStart: 1972,
                yearEnd: 1984,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 2,
                slug: 'second',
                title: 'Second generation',
                description: 'This was the second generation of video game consoles',
                yearStart: 1976,
                yearEnd: 1992,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 3,
                slug: 'third',
                title: 'Third generation',
                description: 'This was the third generation of video game consoles',
                yearStart: 1983,
                yearEnd: 2003,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 4,
                slug: 'fourth',
                title: 'Fourth generation',
                description: 'This was the fourth generation of video game consoles',
                yearStart: 1987,
                yearEnd: 2004,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 5,
                slug: 'fifth',
                title: 'Fifth generation',
                description: 'This was the fifth generation of video game consoles',
                yearStart: 1993,
                yearEnd: 2005,
                createdAt: new Date(),
                updatedAt: new Date()
            },            {
                id: 6,
                slug: 'sixth',
                title: 'Sixth generation',
                description: 'This was the sixth generation of video game consoles',
                yearStart: 1998,
                yearEnd: 2013,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 7,
                slug: 'seventh',
                title: 'Seventh generation',
                description: 'This was the seventh generation of video game consoles',
                yearStart: 2005,
                yearEnd: 2017,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 8,
                slug: 'eighth',
                title: 'Eighth generation',
                description: 'This was the eighth generation of video game consoles',
                yearStart: 2012,
                yearEnd: 2022,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 9,
                slug: 'ninth',
                title: 'Ninth generation',
                description: 'This was the ninth generation of video game consoles',
                yearStart: 2020,
                yearEnd: 2028,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    }
};
