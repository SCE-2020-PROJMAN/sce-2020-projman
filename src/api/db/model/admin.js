export default (sequelize) => {
    const model = sequelize.define('admin', {
    }, {
        freezeTableName: true,
    });

    model.associate = (models) => {
        model.belongsTo(models.user, {foreignKey: {primaryKey: true}, onDelete: 'CASCADE'});
        model.belongsToMany(models.store, {through: models.storeAdmin});
    };

    return model;
};
