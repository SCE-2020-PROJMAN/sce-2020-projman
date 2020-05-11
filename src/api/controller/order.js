import dependencyInjector from '../util/dependencyInjector';
import controllerResponse from '../util/controllerResponse';
import validationUtil from '../util/validation';

function create(customerEmail, shippingTime, addressId, dependencies = null) {
    dependencies = dependencyInjector(['db'], dependencies);

    if (!validationUtil.isEmail(customerEmail)) {
        return controllerResponse(true, 400, 'validation/customerEmail');
    }
    if (!validationUtil.isDate(shippingTime)) {
        return controllerResponse(true, 400, 'validation/shippingTime');
    }
    if (!validationUtil.isNumber()) {
        return controllerResponse(true, 400, 'validation/addressId');
    }
    
    return dependencies.db.sequelize.transaction(async transaction => {
        const [shoppingCart, customer] = await Promise.all([
            dependencies.db.models.shoppingCart.findOne({
                include: [{
                    model: dependencies.db.models.customer,
                    required: true,
                    where: {
                        userEmail: customerEmail,
                    },
                }, {
                    model: dependencies.db.models.shoppingCartProduct,
                    required: false,
                    include: [{
                        model: dependencies.db.models.storeProduct,
                        required: false,
                        include: [{
                            model: dependencies.db.models.product,
                            required: true,
                        }],
                    }],
                }],
                transaction,
            }),
            dependencies.db.models.customer.findOne({
                where: {
                    userEmail: customerEmail,
                },
                transaction,
            }),
        ]);
        if (!shoppingCart || shoppingCart.shoppingCartProducts.length === 0) {
            return controllerResponse(true, 404, 'existence/shoppingCart');
        }
        if (!customer) {
            return controllerResponse(true, 404, 'existence/customer');
        }

        const order = await dependencies.db.models.order.create({
            creationTime: Date.now(),
            shippingTime: shippingTime,
            customerId: customer.id,
            addressId: addressId,
        }, {transaction});

        const productOrders = shoppingCart.shoppingCartProducts.map(shoppingCartProduct => ({
            amount: shoppingCartProduct.amount,
            orderId: order.id,
            productBarcode: shoppingCartProduct.storeProduct.product.barcode,
        }));

        await Promise.all([
            ...productOrders.map(productOrder => {
                return dependencies.db.models.storeProduct.decrement(['amount', productOrder.amount], {
                    where: {
                        productBarcode: productOrder.productBarcode,
                    },
                    transaction,
                });
            }),
            dependencies.db.models.productOrder.bulkCreate(productOrders, {transaction}),
            dependencies.db.models.shoppingCartProduct.destroy({
                where: {
                    shoppingCartId: shoppingCart.id,
                },
                transaction,
            }),
        ]);

        return controllerResponse(false, 200);
    });
}

export default {
    create,
};
