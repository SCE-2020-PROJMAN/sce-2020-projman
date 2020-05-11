export default (sequelize) => {
    const model = sequelize.define('shoppingCart', {
    }, {
        freezeTableName: true,
    });

    model.associate = (models) => {
        model.belongsTo(models.customer);
        model.hasMany(models.shoppingCartProduct);
    };

    return model;
};
