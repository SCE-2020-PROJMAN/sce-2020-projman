import assert from 'assert';
import productController from '../../../../src/api/controller/product';

describe('create', () => {
    it('Checks that requesting exists', async () => {
        const expected = {
            error: true,
            status: 403,
        };
        const actual = await productController.create();
        assert.strictEqual(actual.error, expected.error);
        assert.strictEqual(actual.status, expected.status);
    });

    it('Checks that requesting user is an admin', async () => {
        const expected = {
            error: true,
            status: 403,
        };
        const actual = await productController.create({admin: null});
        assert.strictEqual(actual.error, expected.error);
        assert.strictEqual(actual.status, expected.status);
    });

    it('Checks that barcode exists', async () => {
        const expected = {
            error: true,
            status: 400,
            body: 'validation/barcode',
        };
        const actual = await productController.create({admin: {}}, undefined);
        assert.strictEqual(actual.error, expected.error);
        assert.strictEqual(actual.status, expected.status);
        assert.strictEqual(actual.body, expected.body);
    });
    it('Checks that barcode is a number', async () => {
        const expected = {
            error: true,
            status: 400,
            body: 'validation/barcode',
        };
        const actual = await productController.create({admin: {}}, 'notanumber');
        assert.strictEqual(actual.error, expected.error);
        assert.strictEqual(actual.status, expected.status);
        assert.strictEqual(actual.body, expected.body);
    });
    
    it('Checks that category exists', async () => {
        const expected = {
            error: true,
            status: 400,
            body: 'validation/category',
        };
        const actual = await productController.create({admin: {}}, '01234', undefined);
        assert.strictEqual(actual.error, expected.error);
        assert.strictEqual(actual.status, expected.status);
        assert.strictEqual(actual.body, expected.body);
    });
    it('Checks that category is a string', async () => {
        const expected = {
            error: true,
            status: 400,
            body: 'validation/category',
        };
        const actual = await productController.create({admin: {}}, '01234', 1234);
        assert.strictEqual(actual.error, expected.error);
        assert.strictEqual(actual.status, expected.status);
        assert.strictEqual(actual.body, expected.body);
    });
    
    it('Checks that freeText exists', async () => {
        const expected = {
            error: true,
            status: 400,
            body: 'validation/freeText',
        };
        const actual = await productController.create({admin: {}}, '01234', 'category', undefined);
        assert.strictEqual(actual.error, expected.error);
        assert.strictEqual(actual.status, expected.status);
        assert.strictEqual(actual.body, expected.body);
    });
    it('Checks that freeText is a string', async () => {
        const expected = {
            error: true,
            status: 400,
            body: 'validation/freeText',
        };
        const actual = await productController.create({admin: {}}, '01234', 'category', 1234);
        assert.strictEqual(actual.error, expected.error);
        assert.strictEqual(actual.status, expected.status);
        assert.strictEqual(actual.body, expected.body);
    });
    
    it('Checks that price exists', async () => {
        const expected = {
            error: true,
            status: 400,
            body: 'validation/price',
        };
        const actual = await productController.create({admin: {}}, '01234', 'category', 'freeText', undefined);
        assert.strictEqual(actual.error, expected.error);
        assert.strictEqual(actual.status, expected.status);
        assert.strictEqual(actual.body, expected.body);
    });
    it('Checks that price is a number', async () => {
        const expected = {
            error: true,
            status: 400,
            body: 'validation/price',
        };
        const actual = await productController.create({admin: {}}, '01234', 'category', 'freeText', 'notanumber');
        assert.strictEqual(actual.error, expected.error);
        assert.strictEqual(actual.status, expected.status);
        assert.strictEqual(actual.body, expected.body);
    });
    
    it('Checks that brand exists', async () => {
        const expected = {
            error: true,
            status: 400,
            body: 'validation/brand',
        };
        const actual = await productController.create({admin: {}}, '01234', 'category', 'freeText', '01234', undefined);
        assert.strictEqual(actual.error, expected.error);
        assert.strictEqual(actual.status, expected.status);
        assert.strictEqual(actual.body, expected.body);
    });
    it('Checks that brand is a string', async () => {
        const expected = {
            error: true,
            status: 400,
            body: 'validation/brand',
        };
        const actual = await productController.create({admin: {}}, '01234', 'category', 'freeText', '01234', 1234);
        assert.strictEqual(actual.error, expected.error);
        assert.strictEqual(actual.status, expected.status);
        assert.strictEqual(actual.body, expected.body);
    });
    
    it('Checks that name exists', async () => {
        const expected = {
            error: true,
            status: 400,
            body: 'validation/name',
        };
        const actual = await productController.create({admin: {}}, '01234', 'category', 'freeText', '01234', 'brand', undefined);
        assert.strictEqual(actual.error, expected.error);
        assert.strictEqual(actual.status, expected.status);
        assert.strictEqual(actual.body, expected.body);
    });
    it('Checks that name is a string', async () => {
        const expected = {
            error: true,
            status: 400,
            body: 'validation/name',
        };
        const actual = await productController.create({admin: {}}, '01234', 'category', 'freeText', '01234', 'brand', 1234);
        assert.strictEqual(actual.error, expected.error);
        assert.strictEqual(actual.status, expected.status);
        assert.strictEqual(actual.body, expected.body);
    });

    it('Checks that studentDiscount exists', async () => {
        const expected = {
            error: true,
            status: 400,
            body: 'validation/studentDiscount',
        };
        const actual = await productController.create({admin: {}}, '01234', 'category', 'freeText', '01234', 'brand', 'name', undefined);
        assert.strictEqual(actual.error, expected.error);
        assert.strictEqual(actual.status, expected.status);
        assert.strictEqual(actual.body, expected.body);
    });
    it('Checks that studentDiscount is a number', async () => {
        const expected = {
            error: true,
            status: 400,
            body: 'validation/studentDiscount',
        };
        const actual = await productController.create({admin: {}}, '01234', 'category', 'freeText', '01234', 'brand', 'name', 'notanumber');
        assert.strictEqual(actual.error, expected.error);
        assert.strictEqual(actual.status, expected.status);
        assert.strictEqual(actual.body, expected.body);
    });
    
    it('Checks that storePlace exists', async () => {
        const expected = {
            error: true,
            status: 400,
            body: 'validation/storePlace',
        };
        const actual = await productController.create({admin: {}}, '01234', 'category', 'freeText', '01234', 'brand', 'name', '20.00', undefined);
        assert.strictEqual(actual.error, expected.error);
        assert.strictEqual(actual.status, expected.status);
        assert.strictEqual(actual.body, expected.body);
    });
    it('Checks that storePlace is a string', async () => {
        const expected = {
            error: true,
            status: 400,
            body: 'validation/storePlace',
        };
        const actual = await productController.create({admin: {}}, '01234', 'category', 'freeText', '01234', 'brand', 'name', '20.00', 1234);
        assert.strictEqual(actual.error, expected.error);
        assert.strictEqual(actual.status, expected.status);
        assert.strictEqual(actual.body, expected.body);
    });

    it('Creates a product', async () => {
        const expected = {
            error: false,
            status: 200,
        };
        const barcode = '01234';
        const category = 'category';
        const freeText = 'freeText';
        const price = '10.00';
        const brand = 'brand';
        const name = 'name';
        const studentDiscount = '5.0';
        const storePlace = 'storePlace';
        const transaction = {};
        const actual = await productController.create({admin: {}}, barcode, category, freeText, price, brand, name, studentDiscount, storePlace, {
            db: {
                sequelize: {
                    transaction: (cb) => cb(transaction),
                },
                models: {
                    product: {
                        create: (values, options) => {
                            assert.strictEqual(values.barcode, barcode);
                            assert.strictEqual(values.category, category);
                            assert.strictEqual(values.freeText, freeText);
                            assert.strictEqual(values.price, price);
                            assert.strictEqual(values.brand, brand);
                            assert.strictEqual(values.name, name);
                            assert.strictEqual(values.studentDiscount, studentDiscount);
                            assert.strictEqual(options.transaction, transaction);
                        },
                    },
                    storeProduct: {
                        create: () => {},
                    },
                },
            },
        });
        assert.strictEqual(actual.error, expected.error);
        assert.strictEqual(actual.status, expected.status);
    });

    it('Creates a storeProduct', async () => {
        const expected = {
            error: false,
            status: 200,
        };
        const barcode = '01234';
        const category = 'category';
        const freeText = 'freeText';
        const price = '10.00';
        const brand = 'brand';
        const name = 'name';
        const studentDiscount = '5.0';
        const storePlace = 'storePlace';
        const transaction = {};
        const actual = await productController.create({admin: {}}, barcode, category, freeText, price, brand, name, studentDiscount, storePlace, {
            db: {
                sequelize: {
                    transaction: (cb) => cb(transaction),
                },
                models: {
                    product: {
                        create: () => {},
                    },
                    storeProduct: {
                        create: (values, options) => {
                            assert.strictEqual(values.productBarcode, barcode);
                            assert.strictEqual(values.storePlace, storePlace);
                            assert.strictEqual(options.transaction, transaction);
                        },
                    },
                },
            },
        });
        assert.strictEqual(actual.error, expected.error);
        assert.strictEqual(actual.status, expected.status);
    });
});
