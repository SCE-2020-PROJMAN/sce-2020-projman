export default (sequelize, dataTypes) => {
    const model = sequelize.define('authToken', {
        id: {
            type: dataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: dataTypes.UUIDV4,
        },
        active: {
            type: dataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    }, {
        freezeTableName: true,
    });

    model.associate = (models) => {
        model.belongsTo(models.user);
    };

    return model;
};
