import dependencyInjector from '../util/dependencyInjector';
import controllerResponse from '../util/controllerResponse';
import PDFDocument from 'pdfkit';
//import validationUtil from '../util/validation';

async function detailsOfPurchases(requestingUser, customerEmail,orderCreationTime,dependencies = null){
    dependencies = dependencyInjector(['db'], dependencies);

    if (!requestingUser || !requestingUser.admin) {
        return controllerResponse(true, 403);
    }
    const customer = await dependencies.db.models.customer.findOne({
        where: {
            userEmail: customerEmail,
        },
    });
    if (!customer) {
        return controllerResponse(true, 404, 'existence/customer');
    }

    const orders=await dependencies.db.models.order.returnOrder({
        where: {
            creationTime: orderCreationTime,
            customerId: customer.id,
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
    if (!orders) {
        return controllerResponse(false, 200, []);
    }
    const orderCreated=orders.map(order=>({
        creationTime: order.creationTime,
        shippingTime: order.shippingTime,
        isDone: order.isDone,
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
        shippingAddress: {
            city: order.address.city,
            street: order.address.street,
            house: order.address.house,
            apartment: order.address.apartment,
        },
    
    }));
    const doc = new PDFDocument;
    doc
        .text('The Receipt', 100, 300)
        .font('Times-Roman', 13)
        .moveDown()
        .text('name:',orderCreated.product.name)
        .text('creation Time ',(new Date(orderCreated.creationTime)).toLocaleDateString())
        .text('shipping Time ',(new Date(orderCreated.shippingTime)).toLocaleDateString())
        .text('customer Email',(orderCreated.customer.email))
        .text('address:',(orderCreated.shippingAddress))
        .text('amount:',(orderCreated.productOrder.products.amount))
        .text('category:',(orderCreated.productOrder.products.category))
        .text('free text',orderCreated.product.products.freeText)
        .moveDown()
        .text('shipping address:',orderCreated.shippingAddress.city,orderCreated.shippingAddress.street,orderCreated.shippingAddress.house,orderCreated.shippingAddress.apartment)
    
    ;
    doc.end();
    return controllerResponse(false,200,doc);
}
async function orderCreationTime(requestingUser, customerEmail,dependencies = null)
{
    dependencies = dependencyInjector(['db'], dependencies);

    if (!requestingUser || !requestingUser.admin) {
        return controllerResponse(true, 403);
    }
    const customer = await dependencies.db.models.customer.findOne({
        where: {
            userEmail: customerEmail,
        },
    });
    if (!customer) {
        return controllerResponse(true, 404, 'existence/customer');
    }
    const orders=await dependencies.db.models.order.returnAll({
        where: {
            customerId: customer.id,
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
    const TimeOfOrders=orders.map(order=>({
        creationTime: order.creationTime,
    }));
    
    return controllerResponse(false,200,TimeOfOrders);
}
export default{
    detailsOfPurchases,
    orderCreationTime,
};
