const { models } = require('../../sequelize');

async function getAll(req, res) {
    let platforms;

    if (req.query.selectedGeneration) {

        // if a certain url param was sent, request only the items associated with that parameter
        platforms = await models.platforms.findAll(
            {
                where: { generationId: req.query.selectedGeneration },
                attributes: ['id', 'slug', 'title', 'generationId', 'createdAt']
            }
        );
    } else {
        platforms = await models.platforms.findAll(
            {
                attributes: ['id', 'slug', 'title', 'generationId', 'createdAt']
            }
        );
    }

    res.status(200).json(platforms);
}

async function getBySlug(req, res) {
    const { slug } = req.params;

    const platform = await models.platforms.findOne(
        { where: { slug },
        include: models.generations
        });
    res.status(200).json(platform);
}

module.exports = {
    getAll,
    getBySlug
};
