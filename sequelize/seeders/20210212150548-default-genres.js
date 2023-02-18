'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        // const password =  process.env.SEED_SUPERUSER_PASSWORD || 'defaultpassword';
        const password = null;

        return queryInterface.bulkInsert('genres', [
            {
                id: 1,
                slug: 'action',
                title: 'Action',
                description: 'Everything that doesnt fit shooter, platformer, fighting but has a little of everything and requires good reflexes.',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 2,
                slug: 'shooter',
                title: 'Shooter',
                description: 'Games with a heavy focus on shooting ranged weaponry. In 3d or 3d perspective. Online or offline.',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 3,
                slug: 'platform',
                title: 'Platform',
                description: 'Games that focus on climbing and jumping over obstacles, 2d or 3d. It may involve combat, but its never the main focus. Often has puzzle elements like finding keys.',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 4,
                slug: 'fighting',
                title: 'Fighting',
                description: 'Games involving physical combat with or without weapons. These can be one-on-one beat-em-ups, and scrolling \"brawler\" type of games.',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 5,
                slug: 'stealth',
                title: 'Stealth / survival',
                description: 'Games that focus on survival and stealth aspects, where running away from fights is a game mechanic.',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 6,
                slug: 'adventure',
                title: 'Adventure',
                description: 'Games with a heavy focus on story telling, puzzle solving, item finding, quests. Quite often, the player cannot die. Includes text adventures.',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 7,
                slug: 'rpg',
                title: 'Role-playing game',
                description: 'Like adventure games but with more freedom, more dialogue options, and involving statistics that can be improved. Player can die. You often control multiple people.',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 8,
                slug: 'interactive',
                title: 'Interactive story',
                description: 'Games with a very strong emphasis on storyline, often told first-and and unraveled as the game progresses. Game mechanics are hardly ever important. Usually the player cannot die.',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 9,
                slug: 'simulation',
                title: 'Simulation',
                description: 'Any game attempting to simulate vehicles or situations as real to life as possible, often without clear goals. Driving games excluded',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 10,
                slug: 'racing',
                title: 'Racing',
                description: 'games involving high speed vehicles, optionally with combat elements, but not neccesary reflecting real-life behaviour.',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 11,
                slug: 'strategy',
                title: 'Strategy',
                description: 'These games are often about building up a base or army, to defend or attack opponents. Can be turn-based.',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 12,
                slug: 'sports',
                title: 'Sports',
                description: 'All games that focus on legal, physical performance (ie no street fighting). This excludes driving games and \"bat & ball\" games',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 13,
                slug: 'puzzle',
                title: 'Puzzle',
                description: 'in these games you need to reach certain goals to advance or solve on-screen puzzles, often within a time limit. May involve rhythm games.',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    }
};
