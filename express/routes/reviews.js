const { models } = require('../../sequelize');

async function getAll(req, res) {
    let reviews;

    if (req.query.slug) {

        // platform slug given. first fetch all platforms to determine the platform id, then run the query on reviews
        const platforms = await models.platforms.findAll();

        let platformId = platforms.filter(platform => platform.slug === req.query.slug);

        if (platformId) {
            platformId = platformId[0].id;
        }

        // todo: you can later extend this request with score, genre, released if those parameters came in
        reviews = await models.reviews.findAll(
            {
                where: { platformId },
                attributes: ['id', 'slug', 'title', 'platformId', 'createdAt']
            }
        );

    } else {

        // no platform slug given, return all reviews

        // todo: you can later extend this request with score, genre, released if those parameters came in
        reviews = await models.reviews.findAll(
            {
                attributes: ['id', 'slug', 'title', 'platformId', 'createdAt']
            }
        );
    }

    res.status(200).json(reviews);
}

async function getBySlug(req, res) {
    const { slug } = req.params;

    const review = await models.reviews.findOne(
        { where: { slug },
        include: [models.platforms, models.genres]
        });
    res.status(200).json(review);
}

module.exports = {
    getAll,
    getBySlug
};
