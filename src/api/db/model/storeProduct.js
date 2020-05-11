export default (sequelize, dataTypes) => {
    const model = sequelize.define('storeProduct', {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        amount: {
            type: dataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        freezeTableName: true,
    });

    model.associate = (models) => {
        model.belongsTo(models.product);
        model.belongsTo(models.store);
        model.hasMany(models.shoppingCartProduct);
    };

    return model;
};
