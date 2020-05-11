export default (sequelize, dataTypes) => {
    const model = sequelize.define('product', {
        barcode: {
            type: dataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
        category: {
            type: dataTypes.STRING,
            allowNull: false,
        },
        freeText: {
            type: dataTypes.STRING,
            allowNull: false,
        },
        price: {
            type: dataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        brand: {
            type: dataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: dataTypes.STRING,
            allowNull: false,
        },
        studentDiscount: {
            type: dataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
    }, {
        freezeTableName: true,
    });

    model.associate = (models) => {
        model.hasOne(models.store, {primaryKey: true, through: models.storeProduct});
        model.belongsToMany(models.order, {through: models.productOrder});
        model.hasMany(models.image);
    };

    return model;
};
