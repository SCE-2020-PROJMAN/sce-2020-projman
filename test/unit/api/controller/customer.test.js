import assert from 'assert';
import customerController from '../../../../src/api/controller/customer';

describe('customer controller', () => {
    describe('setAddresses', () => {
        it('Checks that userEmail is valid', async () => {
            const expected = {
                error: true,
                status: 400,
                body: 'validation/userEmail',
            };
            const actual = await customerController.setAddresses('notanemail');
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
            assert.strictEqual(actual.body, expected.body);
        });
        
        it('Checks that customer exists', async () => {
            const expected = {
                error: true,
                status: 404,
                body: 'existence/customer',
            };
            const userEmail = 'some@email.com';
            const actual = await customerController.setAddresses(userEmail, null, {
                db: {
                    models: {
                        customer: {
                            findOne: options => {
                                assert.strictEqual(options.where.userEmail, userEmail);
                                return null;
                            },
                        },
                    },
                },
            });
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
            assert.strictEqual(actual.body, expected.body);
        });
        
        it('Deletes addresses', async () => {
            const expected = {
                error: false,
                status: 200,
            };
            const customerId = 3;
            const transaction = {};
            const userEmail = 'some@email.com';
            let calledDestroy = false;
            const actual = await customerController.setAddresses(userEmail, null, {
                db: {
                    sequelize: {
                        transaction: cb => cb(transaction),
                    },
                    models: {
                        customer: {
                            findOne: options => {
                                assert.strictEqual(options.where.userEmail, userEmail);
                                return {id: customerId};
                            },
                        },
                        address: {
                            destroy: options => {
                                calledDestroy = true;
                                assert.strictEqual(options.where.customerId, customerId);
                                assert.strictEqual(options.transaction, transaction);
                            },
                            bulkCreate: () => null,
                        },
                    },
                },
            });
            assert.strictEqual(calledDestroy, true);
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
        });

        it('Creates new address', async () => {
            const expected = {
                error: false,
                status: 200,
            };
            const customerId = 3;
            const transaction = {};
            const userEmail = 'some@email.com';
            let calledCreate = false;
            const address = {
                city: 'city',
                street: 'street',
                house: 'house',
                apartment: 'apartment',
            };
            const actual = await customerController.setAddresses(userEmail, [address], {
                db: {
                    sequelize: {
                        transaction: cb => cb(transaction),
                    },
                    models: {
                        customer: {
                            findOne: options => {
                                assert.strictEqual(options.where.userEmail, userEmail);
                                return {id: customerId};
                            },
                        },
                        address: {
                            destroy: () => null,
                            bulkCreate: (values, options) => {
                                calledCreate = true;
                                assert.strictEqual(values.length, 1);
                                assert.strictEqual(values[0].city, address.city);
                                assert.strictEqual(values[0].street, address.street);
                                assert.strictEqual(values[0].house, address.house);
                                assert.strictEqual(values[0].apartment, address.apartment);
                                assert.strictEqual(values[0].customerId, customerId);
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
});
