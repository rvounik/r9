const { models } = require('../../sequelize');

async function getAll(req, res) {
    const generations = await models.generations.findAll({
        attributes: ['id', 'slug', 'title', 'yearStart', 'yearEnd', 'description']
    });
    res.status(200).json(generations);
}

async function getBySlug(req, res) {
    const { slug } = req.params;

    const generations = await models.generations.findOne(
        { where: { slug }}
    );
    res.status(200).json(generations);
}

module.exports = {
    getBySlug,
    getAll
};
