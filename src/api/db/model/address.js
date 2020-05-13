export default (sequelize, dataTypes) => {
    const model = sequelize.define('address', {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        city: {
            type: dataTypes.STRING,
            allowNull: false,
        },
        street: {
            type: dataTypes.STRING,
            allowNull: false,
        },
        house: {
            type: dataTypes.STRING,
            allowNull: false,
        },
        apartment: {
            type: dataTypes.STRING,
            allowNull: true,
        },
    }, {
        freezeTableName: true,
    });

    model.associate = (models) => {
        model.belongsTo(models.customer);
        model.hasMany(models.order);
    };

    return model;
};
