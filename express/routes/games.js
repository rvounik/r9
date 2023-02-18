const { models } = require('../../sequelize');

async function getAll(req, res) {
    let games = await models.games.findAll(
        {
            attributes: ['id', 'slug', 'title', 'genreId', 'released', 'createdAt']
        }
    );

    res.status(200).json(games);
}

async function getBySlug(req, res) {
    const { slug } = req.params;

    const game = await models.games.findOne(
        { where: { slug },
        include: models.genres
        });
    res.status(200).json(game);
}

module.exports = {
    getAll,
    getBySlug
};
