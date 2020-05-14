export default (sequelize, dataTypes) => {
    const model = sequelize.define('storeAdmin', {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
    }, {
        freezeTableName: true,
    });

    model.associate = (models) => {
        model.belongsTo(models.admin, {onDelete: 'CASCADE'});
        model.belongsTo(models.store, {onDelete: 'CASCADE'});
    };

    return model;
};
