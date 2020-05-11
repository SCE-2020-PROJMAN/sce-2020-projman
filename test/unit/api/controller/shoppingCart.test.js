import assert from 'assert';
import shoppingCartController from '../../../../src/api/controller/shoppingCart';

describe('add', () => {
    it('Checks that customerEmail is valid', async () => {
        const expected = {
            error: true,
            status: 400,
            body: 'validation/customerEmail',
        };
        const actual = await shoppingCartController.add('notanemail');
        assert.strictEqual(actual.error, expected.error);
        assert.strictEqual(actual.status, expected.status);
        assert.strictEqual(actual.body, expected.body);
    });
    
    it('Checks that storePlace is valid', async () => {
        const expected = {
            error: true,
            status: 400,
            body: 'validation/storePlace',
        };
        const actual = await shoppingCartController.add('some@email.com', 1234);
        assert.strictEqual(actual.error, expected.error);
        assert.strictEqual(actual.status, expected.status);
        assert.strictEqual(actual.body, expected.body);
    });
    
    it('Checks that productBarcode is valid', async () => {
        const expected = {
            error: true,
            status: 400,
            body: 'validation/productBarcode',
        };
        const actual = await shoppingCartController.add('some@email.com', 'storePlace', 'notanumber');
        assert.strictEqual(actual.error, expected.error);
        assert.strictEqual(actual.status, expected.status);
        assert.strictEqual(actual.body, expected.body);
    });
    
    it('Checks that amount is valid', async () => {
        const expected = {
            error: true,
            status: 400,
            body: 'validation/amount',
        };
        const actual = await shoppingCartController.add('some@email.com', 'storePlace', '01234', 'notanumber');
        assert.strictEqual(actual.error, expected.error);
        assert.strictEqual(actual.status, expected.status);
        assert.strictEqual(actual.body, expected.body);
    });
    
    it('Checks that product exists in store', async () => {
        const expected = {
            error: true,
            status: 404,
            body: 'existence/storeProduct',
        };
        const actual = await shoppingCartController.add('some@email.com', 'storePlace', '01234', 1, {
            db: {
                models: {
                    storeProduct: {
                        findOne: () => null,
                    },
                },
            },
        });
        assert.strictEqual(actual.error, expected.error);
        assert.strictEqual(actual.status, expected.status);
        assert.strictEqual(actual.body, expected.body);
    });
    
    it('Creates a shoppingCart if neccesary', async () => {
        const expected = {
            error: false,
            status: 200,
        };
        const customerEmail = 'some@email.com';
        const storeProductId = 3;
        const shoppingCartId = 5;
        const transaction = {};
        let calledFindOrCreate = false;
        const actual = await shoppingCartController.add(customerEmail, 'storePlace', '01234', 1, {
            db: {
                sequelize: {
                    transaction: cb => cb(transaction),
                },
                models: {
                    storeProduct: {
                        findOne: () => ({id: storeProductId}),
                    },
                    shoppingCart: {
                        findOrCreate: options => {
                            calledFindOrCreate = true;
                            assert.strictEqual(options.where.customerEmail, customerEmail);
                            assert.strictEqual(options.transaction, transaction);
                            return [{id: shoppingCartId}];
                        },
                    },
                    shoppingCartProduct: {
                        create: () => {},
                    },
                },
            },
        });
        assert.strictEqual(calledFindOrCreate, true);
        assert.strictEqual(actual.error, expected.error);
        assert.strictEqual(actual.status, expected.status);
    });
    
    it('Creates a shoppingCartProduct', async () => {
        const expected = {
            error: false,
            status: 200,
        };
        const customerEmail = 'some@email.com';
        const storePlace = 'storePlace';
        const productBarcode = '01234';
        const storeProductId = 3;
        const shoppingCartId = 5;
        const amount = 1;
        const transaction = {};
        let calledCreate = false;
        const actual = await shoppingCartController.add(customerEmail, storePlace, productBarcode, amount, {
            db: {
                sequelize: {
                    transaction: cb => cb(transaction),
                },
                models: {
                    storeProduct: {
                        findOne: () => ({id: storeProductId}),
                    },
                    shoppingCart: {
                        findOrCreate: () => {
                            return [{id: shoppingCartId}];
                        },
                    },
                    shoppingCartProduct: {
                        create: (values, options) => {
                            calledCreate = true;
                            assert.strictEqual(values.amount, amount);
                            assert.strictEqual(values.shoppingCartId, shoppingCartId);
                            assert.strictEqual(values.storeProductId, storeProductId);
                            assert.strictEqual(options.transaction, transaction);
                        },
                    },
                },
            },
        });
        assert.strictEqual(calledCreate, true);
        assert.strictEqual(actual.error, expected.error);
        assert.strictEqual(actual.status, expected.status);
    });
});
