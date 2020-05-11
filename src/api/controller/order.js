import moment from 'moment';
import dependencyInjector from '../util/dependencyInjector';
import controllerResponse from '../util/controllerResponse';
import validationUtil from '../util/validation';
import priceUtil from '../../util/price';

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
                        // TODO: Also the particular store
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

async function calculateAnalytics(requestingUser, dependencies = null) {
    dependencies = dependencyInjector(['db'], dependencies);

    if (!requestingUser || !requestingUser.admin) {
        return controllerResponse(true, 403);
    }

    const orders = await dependencies.db.models.order.findAll({
        where: {
            isDone: true,
        },
        include: [{
            model: dependencies.db.models.productOrder,
            required: true,
            include: [{
                model: dependencies.db.models.product,
                required: true,
            }],
        }, {
            model: dependencies.db.models.customer,
            required: true,
        }],
    });

    let totalRevenue = 0;
    const revenuePerCategory = {};
    const revenuePerDayOfWeek = {
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
        saturday: 0,
        sunday: 0,
    };
    orders.forEach(order => {
        const price = priceUtil.getPrice(order.customer.isStudent, order.productOrder.product.price, order.productOrder.product.studentDiscount);
        const amount = order.productOrder.amount;
        const total = price * amount;
        const category = order.productOrder.product.category;
        const orderDate = order.creationTime;
        const orderWeekDay = moment(orderDate).isoWeekday(); // 1 = monday, 7 = sunday
        const weekDays = {
            1: 'monday',
            2: 'tuesday',
            3: 'wednesday',
            4: 'thursday',
            5: 'friday',
            6: 'saturday',
            7: 'sunday',
        };

        totalRevenue += total;
        if (!revenuePerCategory[category]) {
            revenuePerCategory[category] = 0;
        }
        revenuePerCategory[category] += total;
        revenuePerDayOfWeek[weekDays[orderWeekDay]] += total;
    });

    return controllerResponse(false, 200, {
        revenue: {
            total: totalRevenue,
            perCategory: revenuePerCategory,
            perDayOfWeek: revenuePerDayOfWeek,
        },
    });
}

export default {
    create,
    calculateAnalytics,
};
