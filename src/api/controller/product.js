import dependencyInjector from '../util/dependencyInjector';
import controllerResponse from '../util/controllerResponse';
import validationUtil from '../util/validation';

async function create(requestingUser, barcode, category, freeText, price, brand, name, studentDiscount, storePlace, dependencies = null) {
    dependencies = dependencyInjector(['db'], dependencies);

    if (!requestingUser || !requestingUser.admin) {
        return controllerResponse(true, 403);
    }

    // We don't covert `barcode` to Number globally because they can start with 0
    if (!validationUtil.isNumber(Number(barcode))) {
        return controllerResponse(true, 400, 'validation/barcode');
    }
    if (!validationUtil.isString(category)) {
        return controllerResponse(true, 400, 'validation/category');
    }
    if (!validationUtil.isString(freeText)) {
        return controllerResponse(true, 400, 'validation/freeText');
    }
    if (!validationUtil.isNumber(Number(price))) {
        return controllerResponse(true, 400, 'validation/price');
    }
    if (!validationUtil.isString(brand)) {
        return controllerResponse(true, 400, 'validation/brand');
    }
    if (!validationUtil.isString(name)) {
        return controllerResponse(true, 400, 'validation/name');
    }
    if (!validationUtil.isNumber(Number(studentDiscount))) {
        return controllerResponse(true, 400, 'validation/studentDiscount');
    }
    if (!validationUtil.isString(storePlace)) {
        return controllerResponse(true, 400, 'validation/storePlace');
    }

    await dependencies.db.sequelize.transaction(async transaction => {
        await Promise.all([
            dependencies.db.models.product.create({
                barcode: barcode,
                category: category,
                freeText: freeText,
                price: price,
                brand: brand,
                name: name,
                studentDiscount: studentDiscount,
            }, {transaction}),
            dependencies.db.models.storeProduct.create({
                productBarcode: barcode,
                storePlace: storePlace,
            }, {transaction}),
        ]);
    });

    return controllerResponse(false, 200);
}

export default {
    create,
};
