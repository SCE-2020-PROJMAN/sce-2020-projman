export default (sequelize, dataTypes) => {
    const model = sequelize.define('storeProduct', {
        amount: {
            type: dataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        freezeTableName: true,
    });

    model.associate = (models) => {
        model.belongsTo(models.product, {foreignKey: {primaryKey: true}});
        model.belongsTo(models.store, {foreignKey: {primaryKey: true}});
    };

    return model;
};
