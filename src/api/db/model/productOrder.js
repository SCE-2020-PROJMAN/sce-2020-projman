export default (sequelize, dataTypes) => {
    const model = sequelize.define('productOrder', {
        amount: {
            type: dataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        freezeTableName: true,
    });

    model.associate = (models) => {
        model.belongsTo(models.order, {foreignKey: {primaryKey: true}, onDelete: 'CASCADE'});
        model.belongsTo(models.product, {foreignKey: {primaryKey: true}, onDelete: 'CASCADE'});
    };

    return model;
};
