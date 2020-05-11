import dependencyInjector from '../util/dependencyInjector';
import controllerResponse from '../util/controllerResponse';
import validationUtil from '../util/validation';

async function setStatus(requestingUser, userEmail, isStudent, dependencies = null) {
    dependencies = dependencyInjector(['db'], dependencies);

    if (!requestingUser || !requestingUser.admin) {
        return controllerResponse(true, 403);
    }

    if (!validationUtil.isEmail(userEmail)) {
        return controllerResponse(true, 400, 'validation/userEmail');
    }

    if (!validationUtil.isBool(isStudent)) {
        return controllerResponse(true, 400, 'validation/isStudent');
    }

    const [updatedRowsCount] = await dependencies.db.models.customer.update({
        isStudent: isStudent,
    }, {
        where: {
            userEmail: userEmail,
        },
    });

    if (updatedRowsCount === 0) {
        return controllerResponse(true, 404, 'existence/userEmail');
    }

    return controllerResponse(false);
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
    setStatus,
    setAddresses,
};
