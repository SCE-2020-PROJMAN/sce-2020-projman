import assert from 'assert';
import orderController from '../../../../src/api/controller/order';

describe('order controller', () => {
    describe('create', () => {
        it('Checks that customerEmail is valid');
        it('Checks that shippingTime is valid');
        it('Checks that addressId is valid');
        it('Checks that shopping cart exists');
        it('Checks that customer exists');
        it('Creates an order');
        it('Creates productOrders');
        it('Updates storeProduct amounts');
        it('Empties the shopping cart');
    });

    describe('calculateAnalytics', () => {
        it('Checks that requesting user exists', async () => {
            const expected = {
                error: true,
                status: 403,
            };
            const actual = await orderController.calculateAnalytics();
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
        });
    
        it('Checks that requesting user is an admin', async () => {
            const expected = {
                error: true,
                status: 403,
            };
            const actual = await orderController.calculateAnalytics({admin: null});
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
        });

        it('Calculates total', async () => {
            const expected = {
                error: false,
                status: 200,
            };
            const actual = await orderController.calculateAnalytics({admin: {}}, {
                db: {
                    models: {
                        order: {
                            findAll: () => [{
                                creationTime: Date.now(),
                                customer: {
                                    isStudent: false,
                                },
                                productOrder: {
                                    amount: 2,
                                    product: {
                                        price: 10,
                                        studentDiscount: 0,
                                        category: 'category',
                                    },
                                },
                            }],
                        },
                    },
                },
            });
            assert.strictEqual(actual.body.revenue.total, 20);
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
        });

        it('Calculates per-category total', async () => {
            const expected = {
                error: false,
                status: 200,
            };
            const category = 'myCategory';
            const actual = await orderController.calculateAnalytics({admin: {}}, {
                db: {
                    models: {
                        order: {
                            findAll: () => [{
                                creationTime: Date.now(),
                                customer: {
                                    isStudent: true,
                                },
                                productOrder: {
                                    amount: 2,
                                    product: {
                                        price: 10,
                                        studentDiscount: 5,
                                        category: category,
                                    },
                                },
                            }],
                        },
                    },
                },
            });
            assert.strictEqual(actual.body.revenue.perCategory[category], 10);
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
        });

        it('Calculates per-day-of-week total', async () => {
            const expected = {
                error: false,
                status: 200,
            };
            const someMonday = new Date(2020, 4, 11);
            const actual = await orderController.calculateAnalytics({admin: {}}, {
                db: {
                    models: {
                        order: {
                            findAll: () => [{
                                creationTime: someMonday,
                                customer: {
                                    isStudent: false,
                                },
                                productOrder: {
                                    amount: 10,
                                    product: {
                                        price: 3,
                                        studentDiscount: 0,
                                        category: 'category',
                                    },
                                },
                            }],
                        },
                    },
                },
            });
            assert.strictEqual(actual.body.revenue.perDayOfWeek.sunday, 0);
            assert.strictEqual(actual.body.revenue.perDayOfWeek.monday, 30);
            assert.strictEqual(actual.body.revenue.perDayOfWeek.tuesday, 0);
            assert.strictEqual(actual.body.revenue.perDayOfWeek.wednesday, 0);
            assert.strictEqual(actual.body.revenue.perDayOfWeek.thursday, 0);
            assert.strictEqual(actual.body.revenue.perDayOfWeek.friday, 0);
            assert.strictEqual(actual.body.revenue.perDayOfWeek.saturday, 0);
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
        });
    });
});
