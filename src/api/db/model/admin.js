export default (sequelize, dataTypes) => {
    const model = sequelize.define('admin', {
    }, {
        freezeTableName: true,
    });

    model.associate = (models) => {
        model.belongsTo(models.user, {foreignKey: {primaryKey: true}});
        model.belongsToMany(models.store, {through: models.storeAdmin});
    };

    return model;
};
