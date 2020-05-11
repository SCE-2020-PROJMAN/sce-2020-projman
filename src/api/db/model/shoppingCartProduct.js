export default (sequelize, dataTypes) => {
    const model = sequelize.define('shoppingCartProduct', {
        amount: {
            type: dataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        freezeTableName: true,
    });

    model.associate = (models) => {
        model.belongsTo(models.shoppingCart);
        model.belongsTo(models.storeProduct);
    };

    return model;
};
