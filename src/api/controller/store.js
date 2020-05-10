import dependencyInjector from '../util/dependencyInjector';
import controllerResponse from '../util/controllerResponse';

async function getAll(requestingUser, dependencies = null) {
    dependencies = dependencyInjector(['db'], dependencies);

    const stores = await dependencies.db.models.store.findAll();
    if (!stores || stores.length === 0) {
        return controllerResponse(true, 404);
    }
    return controllerResponse(false, 200, stores);
}

export default {
    getAll,
};
