module.exports = {
    development: {
        "username": process.env.DB_USER,
        "password": process.env.DB_PASS,
        "database": process.env.DB_NAME,
        "host": process.env.HOST,
        "dialect":  process.env.DB_DIALECT
    },
    production: {
        "username": process.env.DB_USER,
        "password": process.env.DB_PASS,
        "database": process.env.DB_NAME,
        "host": process.env.HOST,
        "dialect":  process.env.DB_DIALECT
    },
};
