export default (sequelize, dataTypes) => {
    const model = sequelize.define('order', {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
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
        model.belongsTo(models.customer, {onDelete: 'CASCADE'});
        model.belongsToMany(models.product, {through: models.productOrder});
        model.belongsTo(models.address);
    };

    return model;
};
