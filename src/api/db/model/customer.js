export default (sequelize, dataTypes) => {
    const model = sequelize.define('customer', {
        isStudent: {
            type: dataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    }, {
        freezeTableName: true,
    });

    model.associate = (models) => {
        model.hasMany(models.address);
        model.belongsTo(models.user, {foreignKey: {primaryKey: true}, onDelete: 'CASCADE'});
        model.hasMany(models.order);
    };

    return model;
};
