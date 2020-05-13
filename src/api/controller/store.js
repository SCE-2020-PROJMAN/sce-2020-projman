import dependencyInjector from '../util/dependencyInjector';
import controllerResponse from '../util/controllerResponse';
import validationUtil from '../util/validation';

async function getAll(requestingUser, dependencies = null) {
    dependencies = dependencyInjector(['db'], dependencies);

    const stores = await dependencies.db.models.store.findAll();
    if (!stores || stores.length === 0) {
        return controllerResponse(true, 404);
    }
    return controllerResponse(false, 200, stores);
}

async function updateProductAmount(requestingUser, store, barcode, amount, dependencies = null) {
    dependencies = dependencyInjector(['db'], dependencies);

    if (!requestingUser || !requestingUser.admin) {
        return controllerResponse(true, 403);
    }

    if (!validationUtil.isString(store)) {
        return controllerResponse(true, 400, 'validation/store');
    }
    // We don't covert `barcode` to Number globally because they can start with 0
    if (barcode === '' || !validationUtil.isNumber(Number(barcode))) {
        return controllerResponse(true, 400, 'validation/barcode');
    }
    amount = Number(amount);
    if (!validationUtil.isNumber(amount)) {
        return controllerResponse(true, 400, 'validation/amount');
    }

    const [updatedRowsCount] = await dependencies.db.models.storeProduct.update({
        amount: amount,
    }, {
        where: {
            productBarcode: barcode,
            storePlace: store,
        },
    });

    if (updatedRowsCount === 0) {
        await dependencies.db.models.storeProduct.create({
            amount: amount,
            productBarcode: barcode,
            storePlace: store,
        });
    }

    return controllerResponse(false, 200);
}

export default {
    getAll,
    updateProductAmount,
};
