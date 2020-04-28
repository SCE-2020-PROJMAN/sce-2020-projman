export default (sequelize, dataTypes) => {
    const model = sequelize.define('order', {
        creationTime: {
            type: dataTypes.DATE,
            primaryKey: true,
            allowNull: false,
        },
        shippingTime: {
            type: dataTypes.DATE,
            allowNull: false,
        },
    }, {
        freezeTableName: true,
    });

    model.associate = (models) => {
        model.belongsTo(models.customer, {foreignKey: {primaryKey: true}});
        model.belongsToMany(models.product, {through: models.productOrder});
    };

    return model;
};
