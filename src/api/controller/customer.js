import dependencyInjector from '../util/dependencyInjector';
import controllerResponse from '../util/controllerResponse';
import validationUtil from '../util/validation';

async function getAddresses(userEmail, dependencies = []) {
    dependencies = dependencyInjector(['db'], dependencies);
    
    if (!validationUtil.isEmail(userEmail)) {
        return controllerResponse(true, 400, 'validation/userEmail');
    }

    const addresses = await dependencies.db.models.address.findAll({
        include: [{
            model: dependencies.db.models.customer,
            required: true,
            where: {
                userEmail: userEmail,
            },
        }],
    });
    if (!addresses || addresses.length === 0) {
        return controllerResponse(false, 200, []);
    }
    
    return controllerResponse(false, 200, addresses);
}

async function setAddresses(userEmail, addresses, dependencies = []) {
    dependencies = dependencyInjector(['db'], dependencies);

    if (!validationUtil.isEmail(userEmail)) {
        return controllerResponse(true, 400, 'validation/userEmail');
    }
    if (!validationUtil.exists(addresses)) {
        addresses = [];
    }
    if (!validationUtil.isArray(addresses)) {
        return controllerResponse(true, 400, 'validation/addresses');
    }
    if (!validationUtil.each(addresses, address => {
        return (
            validationUtil.isString(address.city) &&
            validationUtil.isString(address.street) &&
            validationUtil.isString(address.house) &&
            validationUtil.isString(address.apartment)
        );
    })) {
        return controllerResponse(true, 400, 'validation/addresses');
    }

    const customer = await dependencies.db.models.customer.findOne({
        where: {
            userEmail: userEmail,
        },
    });
    if (!customer) {
        return controllerResponse(true, 404, 'existence/customer');
    }

    await dependencies.db.sequelize.transaction(async transaction => {
        await dependencies.db.models.address.destroy({
            where: {
                customerId: customer.id,
            },
            transaction,
        });
        await dependencies.db.models.address.bulkCreate(addresses.map(address => ({
            ...address,
            customerId: customer.id,
        })), {transaction});
    });

    return controllerResponse(false, 200);
}

export default {
    getAddresses,
    setAddresses,
};
