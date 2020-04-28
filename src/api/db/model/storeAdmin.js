export default (sequelize, dataTypes) => {
    const model = sequelize.define('storeAdmin', {
    }, {
        freezeTableName: true,
    });

    model.associate = (models) => {
        model.belongsTo(models.admin, {foreignKey: {primaryKey: true}});
        model.belongsTo(models.store, {foreignKey: {primaryKey: true}});
    };

    return model;
};
