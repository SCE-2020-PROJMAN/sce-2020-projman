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
        isDone: {
            type: dataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    }, {
        freezeTableName: true,
    });

    model.associate = (models) => {
        model.belongsTo(models.customer, {foreignKey: {primaryKey: true}, onDelete: 'CASCADE'});
        model.belongsToMany(models.product, {through: models.productOrder});
        model.belongsTo(models.address);
    };

    return model;
};
