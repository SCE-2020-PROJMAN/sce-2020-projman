export default (sequelize, dataTypes) => {
    const model = sequelize.define('address', {
        city: {
            type: dataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
        street: {
            type: dataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
        house: {
            type: dataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
        apartment: {
            type: dataTypes.STRING,
            primaryKey: true,
            allowNull: true,
        },
    }, {
        freezeTableName: true,
    });

    model.associate = (models) => {
        model.belongsTo(models.customer);
    };

    return model;
};
