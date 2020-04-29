export default (sequelize, dataTypes) => {
    const model = sequelize.define('user', {
        email: {
            type: dataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        password: {
            type: dataTypes.STRING,
            allowNull: false,
        },
    }, {
        freezeTableName: true,
    });

    model.associate = (models) => {
        model.hasMany(models.authToken);
        model.hasOne(models.customer);
        model.hasOne(models.admin);
    };

    return model;
};
