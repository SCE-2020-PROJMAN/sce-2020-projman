import dependencyInjector from '../util/dependencyInjector';
import controllerResponse from '../util/controllerResponse';
import validationUtil from '../util/validation';

async function getAll(requestingUser, dependencies = null) {
    dependencies = dependencyInjector(['db'], dependencies);

    if (!requestingUser || !requestingUser.admin) {
        return controllerResponse(true, 403);
    }

    const users = await dependencies.db.models.user.findAll({
        include: [{
            model: dependencies.db.models.customer,
            required: false,
        }, {
            model: dependencies.db.models.admin,
            required: false,
            include: [{
                model: dependencies.db.models.storeAdmin,
                required: false,
            }],
        }],
    });

    return controllerResponse(false, 200, users);
}

async function setType(requestingUser, email, isCustomer, isStudent, isAdmin, adminStores, dependencies = null) {
    dependencies = dependencyInjector(['db'], dependencies);

    if (!requestingUser || !requestingUser.admin) {
        return controllerResponse(true, 403);
    }

    if (validationUtil.exists(isCustomer)) {
        if (!validationUtil.isBool(isCustomer)) {
            return controllerResponse(true, 400, 'validation/isCustomer');
        }
        if (isCustomer === true && !validationUtil.isBool(isStudent)) {
            return controllerResponse(true, 400, 'validation/isStudent');
        }
    }

    if (validationUtil.exists(isAdmin)) {
        if (!validationUtil.isBool(isAdmin)) {
            return controllerResponse(true, 400, 'validation/isAdmin');
        }
        if (isAdmin === true && !validationUtil.isArray(adminStores) || !validationUtil.each(adminStores, store => validationUtil.isString(store))) {
            return controllerResponse(true, 400, 'validation/adminStores');
        }
    }

    const promises = [];
    if (validationUtil.exists(isCustomer)) {
        if (isCustomer) {
            promises.push((async () => {
                const [customer, wasCreated] = await dependencies.db.models.customer.findOrCreate({
                    where: {
                        userEmail: email,
                    },
                    defaults: {
                        userEmail: email,
                        isStudent: isStudent,
                    },
                });
                if (!wasCreated) {
                    customer.isStudent = isStudent;
                    await customer.save();
                }
            })());

        } else {
            promises.push(dependencies.db.models.customer.destroy({
                where: {
                    userEmail: email,
                },
            }));
        }
    }
    if (validationUtil.exists(isAdmin)) {
        if (isAdmin) {
            promises.push((async () => {
                const [admin, wasCreated] = await dependencies.db.models.admin.findOrCreate({
                    where: {
                        userEmail: email,
                    },
                    defaults: {
                        userEmail: email,
                    },
                });
                await dependencies.db.sequelize.transaction(async transaction => {
                    if (!wasCreated) {
                        await dependencies.db.models.storeAdmin.destroy({
                            where: {
                                adminId: admin.id,
                            },
                            transaction,
                        });
                    }
                    console.log(adminStores.map(store => ({
                        adminId: admin.id,
                        storePlace: store,
                    })));
                    await dependencies.db.models.storeAdmin.bulkCreate(adminStores.map(store => ({
                        adminId: admin.id,
                        storePlace: store,
                    })), {transaction});
                });
            })());

        } else {
            promises.push(dependencies.db.models.admin.destroy({
                where: {
                    userEmail: email,
                },
            }));
        }
    }

    await Promise.all(promises);

    return controllerResponse(false, 200);
}

export default {
    getAll,
    setType,
};
