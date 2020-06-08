import moment from 'moment';
import PDFDocument from 'pdfkit';
import dependencyInjector from '../util/dependencyInjector';
import controllerResponse from '../util/controllerResponse';
import validationUtil from '../util/validation';
import priceUtil from '../../util/price';
import pdfDigitalSignUtil from '../util/pdfDigitalSign';

async function getAll(requestingUser, dependencies = null) {
    dependencies = dependencyInjector(['db'], dependencies);

    if (!requestingUser || !requestingUser.admin) {
        return controllerResponse(true, 403);
    }

    const orders = await dependencies.db.models.order.findAll({
        include: [{
            model: dependencies.db.models.customer,
            required: true,
        }, {
            model: dependencies.db.models.productOrder,
            required: true,
            include: [{
                model: dependencies.db.models.product,
                required: true,
            }],
        }, {
            model: dependencies.db.models.address,
            required: true,
        }],
    });
    if (!orders) {
        return controllerResponse(false, 200, []);
    }

    const processedOrders = orders.map(order => ({
        creationTime: order.creationTime,
        shippingTime: order.shippingTime,
        isDone: order.isDone,
        isLate: !order.isDone && (new Date(order.shippingTime) < (new Date())),
        revenue: (order.productOrders || []).reduce(
            (sum, productOrder) => (
                sum + (
                    productOrder.amount * priceUtil.getPrice(
                        order.customer.isStudent,
                        productOrder.product.price,
                        productOrder.product.studentDiscount
                    )
                )
            ),
            0
        ),
        products: (order.productOrders || []).map(productOrder => ({
            amount: productOrder.amount,
            barcode: productOrder.product.barcode,
            category: productOrder.product.category,
            freeText: productOrder.product.freeText,
            price: productOrder.product.price,
            brand: productOrder.product.brand,
            name: productOrder.product.name,
            studentDiscount: productOrder.product.studentDiscount,
        })),
        customer: {
            isStudent: order.customer.isStudent,
            email: order.customer.userEmail,
        },
        shippingAddress: {
            city: order.address.city,
            street: order.address.street,
            house: order.address.house,
            apartment: order.address.apartment,
        },
    }));

    return controllerResponse(false, 200, processedOrders);
}

function create(customerEmail, shippingTime, addressId, dependencies = null) {
    dependencies = dependencyInjector(['db'], dependencies);

    if (!validationUtil.isEmail(customerEmail)) {
        return controllerResponse(true, 400, 'validation/customerEmail');
    }
    if (!validationUtil.isDate(shippingTime)) {
        return controllerResponse(true, 400, 'validation/shippingTime');
    }
    if (!validationUtil.isNumber(Number(addressId))) {
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

        const outOfStock = shoppingCart.shoppingCartProducts.reduce((prev, shoppingCartProduct) => (prev || shoppingCartProduct.amount > shoppingCartProduct.storeProduct.amount), false);
        if (outOfStock) {
            return controllerResponse(true, 422, 'bl/storeProduct/amount');
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
            ...shoppingCart.shoppingCartProducts.map(shoppingCartProduct => {
                return dependencies.db.models.storeProduct.decrement({amount: shoppingCartProduct.amount}, {
                    where: {
                        productBarcode: shoppingCartProduct.storeProduct.product.barcode,
                        storePlace: shoppingCartProduct.storeProduct.storePlace,
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

        return controllerResponse(false, 200, {
            id: order.id,
            creationTime: order.creationTime,
        });
    });
}

async function destroy(requestingUser, orderCreationTime, orderCustomerEmail, dependencies = null) {
    dependencies = dependencyInjector(['db'], dependencies);

    if (!requestingUser || !requestingUser.admin) {
        return controllerResponse(true, 403);
    }

    if (!validationUtil.exists(orderCreationTime)) {
        return controllerResponse(true, 400, 'validation/orderCreationTime');
    }
    
    if (!validationUtil.isEmail(orderCustomerEmail)) {
        return controllerResponse(true, 400, 'validation/orderCustomerEmail');
    }

    const customer = await dependencies.db.models.customer.findOne({
        where: {
            userEmail: orderCustomerEmail,
        },
    });
    if (!customer) {
        return controllerResponse(true, 404, 'existence/customer');
    }

    // associated `productOrder`s will be deleted automatically if their `onDelete` is set to `CASCADE`
    const deletedCount = await dependencies.db.models.order.destroy({
        where: {
            creationTime: orderCreationTime,
            customerId: customer.id,
            isDone: false,
        },
    });

    if (deletedCount === 0) {
        return controllerResponse(true, 404, 'existence/order');
    }

    return controllerResponse(false, 200);
}

async function edit(requestingUser, orderCreationTime, orderCustomerEmail, isDone, dependencies = null) {
    dependencies = dependencyInjector(['db'], dependencies);

    if (!requestingUser || !requestingUser.admin) {
        return controllerResponse(true, 403);
    }

    if (!validationUtil.exists(orderCreationTime)) {
        return controllerResponse(true, 400, 'validation/orderCreationTime');
    }
    
    if (!validationUtil.isEmail(orderCustomerEmail)) {
        return controllerResponse(true, 400, 'validation/orderCustomerEmail');
    }

    if (validationUtil.exists(isDone) && !validationUtil.isBool(isDone)) {
        return controllerResponse(true, 400, 'validation/isDone');
    }

    const customer = await dependencies.db.models.customer.findOne({
        where: {
            userEmail: orderCustomerEmail,
        },
    });
    if (!customer) {
        return controllerResponse(true, 404, 'existence/customer');
    }

    const delta = {};
    const addIfExists = (key, val) => {
        if (validationUtil.exists(val)) {
            delta[key] = val;
        }
    };
    addIfExists('isDone', isDone);
    
    if (Object.keys(delta).length !== 0) {
        const [updatedRowsCount] = await dependencies.db.models.order.update(delta, {
            where: {
                creationTime: orderCreationTime,
                customerId: customer.id,
                isDone: false, // can only edit orders that aren't done
            },
        });

        if (updatedRowsCount === 0) {
            return controllerResponse(true, 404, 'existence/order');
        }
    }

    return controllerResponse(false, 200);
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
        order.productOrders.forEach(productOrder => {
            const price = priceUtil.getPrice(order.customer.isStudent, productOrder.product.price, productOrder.product.studentDiscount);
            const amount = productOrder.amount;
            const total = price * amount;
            const category = productOrder.product.category;
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
    });

    return controllerResponse(false, 200, {
        revenue: {
            total: totalRevenue,
            perCategory: revenuePerCategory,
            perDayOfWeek: revenuePerDayOfWeek,
        },
    });
}

async function getReceipt(customerEmail, orderId, orderCreationTime, dependencies = null) {
    dependencies = dependencyInjector(['db'], dependencies);

    const order = await dependencies.db.models.order.findOne({
        where: {
            id: orderId,
            creationTime: orderCreationTime,
        },
        include: [{
            model: dependencies.db.models.customer,
            required: true,
            where: {
                userEmail: customerEmail,
            },
        }, {
            model: dependencies.db.models.productOrder,
            required: true,
            include: [{
                model: dependencies.db.models.product,
                required: true,
            }],
        }],
    });
    if (!order) {
        return controllerResponse(true, 404, 'existence/order');
    }

    const items = order.productOrders.map(productOrder => {
        const isStudent = order.customer.isStudent;
        const normalPrice = productOrder.product.price;
        const studentDiscount = productOrder.product.studentDiscount;
        const name = productOrder.product.name;
        return {
            name: name,
            pricePerItem: priceUtil.getPrice(isStudent, normalPrice, studentDiscount),
            amount: productOrder.amount,
        };
    });

    const generatePdf = () => {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    info: {
                        Title: 'Receipt',
                        Author: 'SuperSami',
                        Subject: 'Receipt',
                        permissions: {
                            modifying: false,
                            annotating: false,
                            fillingForms: false,
                        },
                    },
                });

                // https://stackoverflow.com/questions/23686843/how-to-convert-pdfkit-object-into-buffer-using-nodejs
                const parts = [];
                doc.on('data', parts.push.bind(parts));
                doc.on('end', () => resolve(Buffer.concat(parts)));
                doc.on('error', err => reject(err));

                doc.fontSize(10);
                doc.text(`Receipt for order #${order.id} (${order.creationTime})`).moveDown();
                items.forEach(item => {
                    doc.text(`${item.name}: x${item.amount} - ${item.amount * item.pricePerItem}`).moveDown();
                });
                doc.end();
            } catch(err) {
                reject(err);
            }
        });
    };
    const pdf = await generatePdf();
    const signedPdf = await pdfDigitalSignUtil.sign(pdf);
    return controllerResponse(false, 200, signedPdf);
}

export default {
    getAll,
    create,
    destroy,
    edit,
    calculateAnalytics,
    getReceipt,
};
