const { models } = require('../../sequelize');

async function getBySlug(req, res) {
    const { slug } = req.params;

    const page = await models.pages.findOne({ where: { slug } });
    res.status(200).json(page);
}

module.exports = {
    getBySlug
};
