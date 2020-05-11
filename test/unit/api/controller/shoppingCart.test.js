import assert from 'assert';
import shoppingCartController from '../../../../src/api/controller/shoppingCart';

describe('shoppingCart controller', () => {
    describe('add', () => {
        describe('Common', () => {
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
                            customer: {
                                findOne: () => ({}),
                            },
                        },
                    },
                });
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
                const actual = await shoppingCartController.add('some@email.com', 'storePlace', '01234', 1, {
                    db: {
                        models: {
                            storeProduct: {
                                findOne: () => ({}),
                            },
                            customer: {
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
                const customerId = 7;
                let calledFindOrCreate = false;
                const actual = await shoppingCartController.add(customerEmail, 'storePlace', '01234', 1, {
                    db: {
                        models: {
                            storeProduct: {
                                findOne: () => ({id: storeProductId}),
                            },
                            customer: {
                                findOne: () => ({id: customerId}),
                            },
                            shoppingCart: {
                                findOrCreate: options => {
                                    calledFindOrCreate = true;
                                    assert.strictEqual(options.where['$customer.userEmail$'], customerEmail);
                                    assert.strictEqual(options.defaults.customerId, customerId);
                                    return [{id: shoppingCartId}];
                                },
                            },
                            shoppingCartProduct: {
                                create: () => {},
                                findOne: () => null,
                            },
                        },
                    },
                });
                assert.strictEqual(calledFindOrCreate, true);
                assert.strictEqual(actual.error, expected.error);
                assert.strictEqual(actual.status, expected.status);
            });
        });
        
        describe('Product already exists', () => {
            it('Updates existing shoppingCartProduct', async () => {
                const expected = {
                    error: false,
                    status: 200,
                };
                const customerEmail = 'some@email.com';
                const storePlace = 'storePlace';
                const productBarcode = '01234';
                const storeProductId = 3;
                const shoppingCartId = 5;
                const customerId = 7;
                const amount = 1;
                const oldAmount = 13;
                let calledCreate = false;
                let calledFindOne = false;
                let calledUpdate = false;
                const actual = await shoppingCartController.add(customerEmail, storePlace, productBarcode, amount, {
                    db: {
                        models: {
                            storeProduct: {
                                findOne: () => ({id: storeProductId}),
                            },
                            customer: {
                                findOne: () => ({id: customerId}),
                            },
                            shoppingCart: {
                                findOrCreate: () => {
                                    return [{id: shoppingCartId}];
                                },
                            },
                            shoppingCartProduct: {
                                create: () => {
                                    calledCreate = true;
                                },
                                findOne: options => {
                                    calledFindOne = true;
                                    assert.strictEqual(options.where.shoppingCartId, shoppingCartId);
                                    assert.strictEqual(options.where.storeProductId, storeProductId);
                                    return {amount: oldAmount};
                                },
                                update: (values, options) => {
                                    calledUpdate = true;
                                    assert.strictEqual(values.amount, amount + oldAmount);
                                    assert.strictEqual(options.where.shoppingCartId, shoppingCartId);
                                    assert.strictEqual(options.where.storeProductId, storeProductId);
                                },
                            },
                        },
                    },
                });
                assert.strictEqual(calledCreate, false);
                assert.strictEqual(calledFindOne, true);
                assert.strictEqual(calledUpdate, true);
                assert.strictEqual(actual.error, expected.error);
                assert.strictEqual(actual.status, expected.status);
            });
        });
    
        describe('Product doesn\'t exist yet', () => {
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
                const customerId = 7;
                const amount = 1;
                let calledCreate = false;
                let calledFindOne = false;
                let calledUpdate = false;
                const actual = await shoppingCartController.add(customerEmail, storePlace, productBarcode, amount, {
                    db: {
                        models: {
                            storeProduct: {
                                findOne: () => ({id: storeProductId}),
                            },
                            customer: {
                                findOne: () => ({id: customerId}),
                            },
                            shoppingCart: {
                                findOrCreate: () => {
                                    return [{id: shoppingCartId}];
                                },
                            },
                            shoppingCartProduct: {
                                create: values => {
                                    calledCreate = true;
                                    assert.strictEqual(values.amount, amount);
                                    assert.strictEqual(values.shoppingCartId, shoppingCartId);
                                    assert.strictEqual(values.storeProductId, storeProductId);
                                },
                                findOne: options => {
                                    calledFindOne = true;
                                    assert.strictEqual(options.where.shoppingCartId, shoppingCartId);
                                    assert.strictEqual(options.where.storeProductId, storeProductId);
                                    return null;
                                },
                                update: () => {
                                    calledUpdate = true;
                                },
                            },
                        },
                    },
                });
                assert.strictEqual(calledCreate, true);
                assert.strictEqual(calledFindOne, true);
                assert.strictEqual(calledUpdate, false);
                assert.strictEqual(actual.error, expected.error);
                assert.strictEqual(actual.status, expected.status);
            });
        });
    
    });
    
    describe('remove', () => {
        it('Checks that customerEmail is valid', async () => {
            const expected = {
                error: true,
                status: 400,
                body: 'validation/customerEmail',
            };
            const actual = await shoppingCartController.remove('notanemail');
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
            assert.strictEqual(actual.body, expected.body);
        });
        
        it('Checks that shoppingCartProductId is given', async () => {
            const expected = {
                error: true,
                status: 400,
                body: 'validation/shoppingCartProductId',
            };
            const actual = await shoppingCartController.remove('some@email.com');
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
            assert.strictEqual(actual.body, expected.body);
        });
    
        it('Checks that shopping cart belongs to the customer', async () => {
            const expected = {
                error: true,
                status: 404,
                body: 'existence/shoppingCart',
            };
            const customerEmail = 'some@email.com';
            const shoppingCartProductId = 7;
            let calledFindOne = false;
            const actual = await shoppingCartController.remove(customerEmail, shoppingCartProductId, {
                db: {
                    models: {
                        shoppingCart: {
                            findOne: options => {
                                calledFindOne = true;
                                assert.strictEqual(options.include[0].required, true);
                                assert.strictEqual(options.include[0].where.userEmail, customerEmail);
                                return null;
                            },
                        },
                    },
                },
            });
            assert.strictEqual(calledFindOne, true);
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
            assert.strictEqual(actual.body, expected.body);
        });
        
        it('Checks that the product exists', async () => {
            const expected = {
                error: true,
                status: 404,
                body: 'existence/shoppingCartProductId',
            };
            const customerEmail = 'some@email.com';
            const shoppingCartProductId = 7;
            const shoppingCartId = 13;
            let calledDestroy = false;
            const actual = await shoppingCartController.remove(customerEmail, shoppingCartProductId, {
                db: {
                    models: {
                        shoppingCart: {
                            findOne: () => {
                                return {id: shoppingCartId};
                            },
                        },
                        shoppingCartProduct: {
                            destroy: options => {
                                calledDestroy = true;
                                assert.strictEqual(options.where.id, shoppingCartProductId);
                                assert.strictEqual(options.where.shoppingCartId, shoppingCartId);
                                return 0;
                            },
                        },
                    },
                },
            });
            assert.strictEqual(calledDestroy, true);
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
            assert.strictEqual(actual.body, expected.body);
        });
        
        it('Deletes the product', async () => {
            const expected = {
                error: false,
                status: 200,
            };
            const customerEmail = 'some@email.com';
            const shoppingCartProductId = 7;
            const shoppingCartId = 13;
            let calledDestroy = false;
            const actual = await shoppingCartController.remove(customerEmail, shoppingCartProductId, {
                db: {
                    models: {
                        shoppingCart: {
                            findOne: () => {
                                return {id: shoppingCartId};
                            },
                        },
                        shoppingCartProduct: {
                            destroy: options => {
                                calledDestroy = true;
                                assert.strictEqual(options.where.id, shoppingCartProductId);
                                assert.strictEqual(options.where.shoppingCartId, shoppingCartId);
                                return 1;
                            },
                        },
                    },
                },
            });
            assert.strictEqual(calledDestroy, true);
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
        });
    });
    
    describe('get', () => {
        it('Checks that customerEmail is valid', async () => {
            const expected = {
                error: true,
                status: 400,
                body: 'validation/customerEmail',
            };
            const actual = await shoppingCartController.get('notanemail');
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
            assert.strictEqual(actual.body, expected.body);
        });
        
        it('Returns empty array if no shopping cart', async () => {
            const expected = {
                error: false,
                status: 200,
                body: [],
            };
            const customerEmail = 'some@email.com';
            const actual = await shoppingCartController.get(customerEmail, {
                db: {
                    models: {
                        shoppingCart: {
                            findOne: options => {
                                assert.strictEqual(options.include[0].where.userEmail, customerEmail);
                                return null;
                            },
                        },
                    },
                },
            });
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
            assert.deepStrictEqual(actual.body, expected.body);
        });
        
        it('Returns empty array if shopping cart empty', async () => {
            const expected = {
                error: false,
                status: 200,
                body: [],
            };
            const customerEmail = 'some@email.com';
            const actual = await shoppingCartController.get(customerEmail, {
                db: {
                    models: {
                        shoppingCart: {
                            findOne: options => {
                                assert.strictEqual(options.include[0].where.userEmail, customerEmail);
                                return {
                                    shoppingCartProducts: [],
                                };
                            },
                        },
                    },
                },
            });
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
            assert.deepStrictEqual(actual.body, expected.body);
        });
        
        it('Flattens the hierarchy', async () => {
            const amountInCart = 3;
            const amountInStore = 5;
            const shoppingCartProductId = 7;
            const barcode = '01234';
            const category = 'category';
            const freeText = 'freeText';
            const price = '10.00';
            const brand = 'brand';
            const name = 'name';
            const studentDiscount = '8';
            const expected = {
                error: false,
                status: 200,
                body: [{
                    amountInCart: amountInCart,
                    amountInStore: amountInStore,
                    barcode: barcode,
                    category: category,
                    freeText: freeText,
                    price: price,
                    brand: brand,
                    name: name,
                    studentDiscount: studentDiscount,
                    idInShoppingCart: shoppingCartProductId,
                }],
            };
            const customerEmail = 'some@email.com';
            const actual = await shoppingCartController.get(customerEmail, {
                db: {
                    models: {
                        shoppingCart: {
                            findOne: options => {
                                assert.strictEqual(options.include[0].where.userEmail, customerEmail);
                                return {
                                    shoppingCartProducts: [{
                                        id: shoppingCartProductId,
                                        amount: amountInCart,
                                        storeProduct: {
                                            amount: amountInStore,
                                            product: {
                                                barcode: barcode,
                                                category: category,
                                                freeText: freeText,
                                                price: price,
                                                brand: brand,
                                                name: name,
                                                studentDiscount: studentDiscount,
                                            },
                                        },
                                    }],
                                };
                            },
                        },
                    },
                },
            });
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
            assert.deepStrictEqual(actual.body, expected.body);
        });
    });
});
