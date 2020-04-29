export default (sequelize, dataTypes) => {
    const model = sequelize.define('image', {
        url: {
            type: dataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
    }, {
        freezeTableName: true,
    });

    model.associate = (models) => {
        model.hasOne(models.product);
    };

    return model;
};
