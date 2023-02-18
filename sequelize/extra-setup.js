function applyExtraSetup(sequelize) {
    const { platforms, generations, games, genres, reviews } = sequelize.models;

    generations.hasMany(platforms);
    platforms.belongsTo(generations);

    genres.hasMany(games);
    games.belongsTo(genres);

    genres.hasMany(reviews);
    reviews.belongsTo(genres);

    platforms.hasMany(reviews);
    reviews.belongsTo(platforms);
}

module.exports = { applyExtraSetup };
