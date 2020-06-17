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

    const [storeProduct, customer] = await Promise.all([
        dependencies.db.models.storeProduct.findOne({
            where: {
                productBarcode: productBarcode,
                storePlace: storePlace,
            },
        }),
        dependencies.db.models.customer.findOne({
            where: {
                userEmail: customerEmail,
            },
        }),
    ]);
    if (!storeProduct) {
        return controllerResponse(true, 404, 'existence/storeProduct');
    }
    if (!customer) {
        return controllerResponse(true, 404, 'existence/customer');
    }

    const [shoppingCart] = await dependencies.db.models.shoppingCart.findOrCreate({
        where: {
            '$customer.userEmail$': customerEmail,
        },
        include: [{
            model: dependencies.db.models.customer,
            required: true,
        }],
        defaults: {
            customerId: customer.id,
        },
    });

    const alreadyExistingProduct = await dependencies.db.models.shoppingCartProduct.findOne({
        where: {
            shoppingCartId: shoppingCart.id,
            storeProductId: storeProduct.id,
        },
    });

    if (alreadyExistingProduct) {
        await dependencies.db.models.shoppingCartProduct.update({
            amount: alreadyExistingProduct.amount + amount,
        }, {
            where: {
                shoppingCartId: shoppingCart.id,
                storeProductId: storeProduct.id,
            },
        });
    } else {
        await dependencies.db.models.shoppingCartProduct.create({
            amount: amount,
            shoppingCartId: shoppingCart.id,
            storeProductId: storeProduct.id,
        });
    }

    return controllerResponse(false, 200);
}

function getShoppingCartByEmail(customerEmail, includeProducts, dependencies) {
    const queryObject = {
        include: [{
            model: dependencies.db.models.customer,
            required: true,
            where: {
                userEmail: customerEmail,
            },
        }],
    };
    if (includeProducts) {
        queryObject.include.push({
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
        });
    }
    return dependencies.db.models.shoppingCart.findOne(queryObject);
}

async function remove(customerEmail, shoppingCartProductId, dependencies = null) {
    dependencies = dependencyInjector(['db'], dependencies);

    if (!validationUtil.isEmail(customerEmail)) {
        return controllerResponse(true, 400, 'validation/customerEmail');
    }
    if (!validationUtil.exists(shoppingCartProductId)) {
        return controllerResponse(true, 400, 'validation/shoppingCartProductId');
    }

    const shoppingCart = await getShoppingCartByEmail(customerEmail, false, dependencies);
    if (!shoppingCart) {
        return controllerResponse(true, 404, 'existence/shoppingCart');
    }

    const deletedCount = await dependencies.db.models.shoppingCartProduct.destroy({
        where: {
            id: shoppingCartProductId,
            shoppingCartId: shoppingCart.id,
        },
    });

    if (deletedCount === 0) {
        return controllerResponse(true, 404, 'existence/shoppingCartProductId');
    }
    
    return controllerResponse(false, 200);
}

async function get(customerEmail, dependencies = null) {
    dependencies = dependencyInjector(['db'], dependencies);

    if (!validationUtil.isEmail(customerEmail)) {
        return controllerResponse(true, 400, 'validation/customerEmail');
    }

    const shoppingCart = await getShoppingCartByEmail(customerEmail, true, dependencies);
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
        idInShoppingCart: shoppingCartProduct.id,
    }));

    return controllerResponse(false, 200, products);
}

/**
 * Returns products similar to the products already in the customer's shopping cart:
 * * Product with largest discount in a category
 * * Product with same brand
 * * Most popular product in a category
 * * Least popular product in a category
 * Returns at least 3 suggestions, none of which are in the shopping cart
 * @param {String} customerEmail 
 * @param {Object} dependencies 
 */
async function getSuggestions(customerEmail, dependencies = null) {
    dependencies = dependencyInjector(['db'], dependencies);

    const shoppingCart = await getShoppingCartByEmail(customerEmail, true, dependencies);
    if (!shoppingCart || shoppingCart.shoppingCartProducts.length === 0) {
        return controllerResponse(false, 200, []);
    }
    const productsInShoppingCart = shoppingCart.shoppingCartProducts.map(shoppingCartProduct => shoppingCartProduct.storeProduct.product);

    // Get products similar to what's in the customer's shopping cart
    const similarProducts = await Promise.all(productsInShoppingCart.map(async product => {
        const largestDiscount = await dependencies.db.models.product.findOne({
            order: [['studentDiscount', 'DESC']],
            where: {
                category: product.category,
                barcode: {
                    [dependencies.db.Sequelize.Op.ne]: product.barcode,
                },
            },
        });

        const sameBrand = await dependencies.db.models.product.findOne({
            where: {
                brand: product.brand,
                barcode: {
                    [dependencies.db.Sequelize.Op.ne]: product.barcode,
                },
            },
        });

        const productOrdersInCategory = await dependencies.db.models.productOrder.findAll({
            include: [{
                model: dependencies.db.models.product,
                required: true,
                where: {
                    category: product.category,
                    barcode: {
                        [dependencies.db.Sequelize.Op.ne]: product.barcode,
                    },
                },
            }],
        });

        const productsWithAmount = {};
        productOrdersInCategory.forEach(productOrder => {
            if (!productsWithAmount[productOrder.product.barcode]) {
                productsWithAmount[productOrder.product.barcode] = {
                    ...(productOrder.product.toJSON()),
                    amount: 0,
                };
            }
            productsWithAmount[productOrder.product.barcode].amount += productOrder.amount;
        });

        const mostPopular = Object.values(productsWithAmount).reduce((max, product) => {
            if (max === null) {
                return product;
            }
            return product.amount > max.amount ? product : max;
        }, null);
        const leastPopular = Object.values(productsWithAmount).reduce((min, product) => {
            if (min === null) {
                return product;
            }
            return product.amount < min.amount ? product : min;
        }, null);

        const products = [];
        if (largestDiscount) {
            products.push(largestDiscount);
        }
        if (sameBrand) {
            products.push(sameBrand);
        }
        if (mostPopular) {
            products.push(mostPopular);
        }
        if (leastPopular) {
            products.push(leastPopular);
        }
        return products;
    }));

    // Flatten the array (since each element is an array)
    const similarProductsArray = similarProducts.reduce((prev, cur) => [...prev, ...cur], []);
    // Remove illegal suggestions
    const suggestions = similarProductsArray.filter(product => {
        function isInShoppingCart() {
            return !!productsInShoppingCart.find(other => other.barcode === product.barcode);
        }

        function isDuplicate() {
            return !!similarProductsArray.find(other => other !== product && other.barcode === product.barcode);
        }

        return !!product && !isInShoppingCart() && !isDuplicate();
    });

    // If not enough suggestions, add arbitrarily
    if (suggestions.length < 3) {
        const extraProducts = await dependencies.db.models.product.findAll({
            order: [['price', 'DESC'], ['studentDiscount', 'DESC']],
            where: {
                barcode: {
                    [dependencies.db.Sequelize.Op.notIn]: [
                        ...productsInShoppingCart.map(product => product.barcode),
                        ...suggestions.map(suggestion => suggestion.barcode),
                    ],
                },
            },
        });
        suggestions.push(...extraProducts.slice(0, 3 - suggestions.length));
    }

    return controllerResponse(false, 200, suggestions);
}

export default {
    add,
    remove,
    get,
    getSuggestions,
};
