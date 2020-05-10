import dependencyInjector from '../util/dependencyInjector';
import controllerResponse from '../util/controllerResponse';

async function getAll(requestingUser, dependencies = null) {
    dependencies = dependencyInjector(['db'], dependencies);

    if (!requestingUser || !requestingUser.admin) {
        return controllerResponse(true, 403);
    }

    const stores = await dependencies.db.store.findAll();
    if (!stores || stores.length === 0) {
        return controllerResponse(true, 404);
    }
    return stores;
}

export default {
    getAll,
};
