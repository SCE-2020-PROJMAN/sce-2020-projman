export default (sequelize, dataTypes) => {
    const model = sequelize.define('store', {
        place: {
            type: dataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
    }, {
        freezeTableName: true,
    });

    model.associate = (models) => {
        model.belongsToMany(models.product, {through: models.storeProduct});
        model.belongsToMany(models.admin, {through: models.storeAdmin});
    };

    return model;
};
