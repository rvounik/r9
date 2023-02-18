const { models } = require('../../../sequelize');

async function create(req, res, next) {
    try {
        const { slug, title, description } = req.body;

        // execute one (optionally with a .then callback) or several async requests (errors are caught by .catch)
        await models.genres.create({
            slug,
            title,
            description
        }).then(response => {

            // set the response code, then either .end() the response process with no return value, use .send('ok')
            // or use the built-in .json({}) converter to return a json-stringified response object (convention!)
            res.status(201).json(response);
        });

    } catch (error) {

        // validation
        if (error && error.errors
            && error.errors[0].type.toUpperCase() === 'VALIDATION ERROR'
            || error.errors[0].type.toUpperCase() === 'NOTNULL VIOLATION') {
            return res.status(400).json(error);
        }

        // conflict
        if (error && error.errors && error.errors[0].type.toUpperCase() === 'UNIQUE VIOLATION') {
            return res.status(409).json(error);
        }

        // return all other errors (likely server-related) as 500 for now
        return res.status(500).json(error);
    }
}

async function getAll(req, res) {
    const genres = await models.genres.findAll({
        attributes: ['id', 'slug', 'title']
    });

    res.status(200).json(genres); // remember, .json() is similar to the send method, internally
}

async function getById(req, res) {
    const genre = await models.genres.findOne({ where: { id: req.params.id } });
    res.status(200).json(genre);
}

async function update(req, res) {
    try {
        await models.genres.update(
            req.body,
            { where: { id: req.params.id }
        }).then(response => {

            // no rows affected, return the response with code
            if (response[0] === 0) {
                return res.status(404).json(response);
            }

            return res.status(200).json(response);
        });
    } catch (error) {

        // validation
        if (error && error.errors
            && error.errors[0].type.toUpperCase() === 'VALIDATION ERROR'
            || error.errors[0].type.toUpperCase() === 'NOTNULL VIOLATION') {
            return res.status(400).json(error);
        }

        // foreign key constraint failed
        if (error.message && !!error.message.indexOf('a foreign key constraint fails')) {
            return res.status(500).json(error);
        }

        // conflict
        if (error && error.errors && error.errors[0].type.toUpperCase() === 'UNIQUE VIOLATION') {
            return res.status(409).json(error);
        }

        // return all other errors (likely server-related) as 500 for now
        return res.status(500).json(error);
    }
}

async function remove(req, res) {
    try {
        await models.genres.destroy(
            { where: { id: req.params.id }
        }).then(response => {

            // no rows affected, return the response with code
            if (response[0] === 0) {
                return res.status(404).json(response);
            }

            return res.status(200).json(response);
        });
    } catch (error) {

        // return all other errors (likely server-related) as 500 for now
        return res.status(500).json(error);
    }
}

module.exports = {
    create,
    getAll,
    getById,
    update,
    remove
};
