import dependencyInjector from '../util/dependencyInjector';
import controllerResponse from '../util/controllerResponse';
import validationUtil from '../util/validation';

async function add(customerEmail, storePlace, productBarcode, amount, dependencies = null) {
    dependencies = dependencyInjector(['db'], dependencies);

    if (!validationUtil.isEmail(customerEmail)) {
        return controllerResponse(true, 400, 'validation/customerEmail');
    }
    if (!validationUtil.isString(storePlace)) {
        return controllerResponse(true, 400, 'validation/storePlace');
    }
    if (!validationUtil.isNumber(Number(productBarcode))) {
        return controllerResponse(true, 400, 'validation/productBarcode');
    }
    amount = Number(amount);
    if (!validationUtil.isNumber(amount)) {
        return controllerResponse(true, 400, 'validation/amount');
    }

    const storeProduct = await dependencies.db.models.storeProduct.findOne({
        where: {
            productBarcode: productBarcode,
            storePlace: storePlace,
        },
    });
    if (!storeProduct) {
        return controllerResponse(true, 404, 'existence/storeProduct');
    }

    await dependencies.db.sequelize.transaction(async transaction => {
        const [shoppingCart] = await dependencies.db.models.shoppingCart.findOrCreate({
            where: {
                customerEmail: customerEmail,
            },
            defaults: {},
            transaction,
        });
        await dependencies.db.models.shoppingCartProduct.create({
            amount: amount,
            shoppingCartId: shoppingCart.id,
            storeProductId: storeProduct.id,
        }, {transaction});
    });

    return controllerResponse(false, 200);
}

export default {
    add,
};
