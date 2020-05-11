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
                '$customer.userEmail$': customerEmail,
            },
            include: [{
                model: dependencies.db.models.customer,
                required: true,
            }],
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

async function get(customerEmail, dependencies = null) {
    dependencies = dependencyInjector(['db'], dependencies);

    if (!validationUtil.isEmail(customerEmail)) {
        return controllerResponse(true, 400, 'validation/customerEmail');
    }

    const shoppingCart = await dependencies.db.models.shoppingCart.findOne({
        where: {
            customerEmail: customerEmail,
        },
        include: [{
            model: dependencies.db.models.shoppingCartProduct,
            required: false,
            include: [{
                model: dependencies.db.models.storeProduct,
                required: true,
                include: [{
                    model: dependencies.db.models.product,
                    required: true,
                }],
            }],
        }],
    });

    if (!shoppingCart || shoppingCart.shoppingCartProducts.length === 0) {
        return controllerResponse(false, 200, []);
    }

    const products = shoppingCart.shoppingCartProducts.map(shoppingCartProduct => ({
        amountInCart: shoppingCartProduct.amount,
        amountInStore: shoppingCartProduct.storeProduct.amount,
        barcode: shoppingCartProduct.storeProduct.product.barcode,
        category: shoppingCartProduct.storeProduct.product.category,
        freeText: shoppingCartProduct.storeProduct.product.freeText,
        price: shoppingCartProduct.storeProduct.product.price,
        brand: shoppingCartProduct.storeProduct.product.brand,
        name: shoppingCartProduct.storeProduct.product.name,
        studentDiscount: shoppingCartProduct.storeProduct.product.studentDiscount,
    }));

    return controllerResponse(false, 200, products);
}

export default {
    add,
    get,
};
