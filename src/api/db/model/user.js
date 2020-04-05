export default (sequelize, dataTypes) => {
    const model = sequelize.define('user', {
        username: {
            type: dataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        password: {
            type: dataTypes.STRING,
            allowNull: false,
        },
        isStudent: {
            type: dataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        isAdmin: {
            type: dataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    }, {
        freezeTableName: true,
    });

    model.associate = (models) => {
        model.hasMany(models.authToken);
    };

    return model;
};
