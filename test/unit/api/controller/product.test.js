import assert from 'assert';
import productController from '../../../../src/api/controller/product';

describe('product controller', () => {
    describe('create', () => {
        it('Checks that requesting user exists', async () => {
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
                                assert.strictEqual(values.amount, 0);
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
    
    describe('edit', () => {
        it('Checks that requesting user exists', async () => {
            const expected = {
                error: true,
                status: 403,
            };
            const actual = await productController.edit();
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
        });
    
        it('Checks that requesting user is an admin', async () => {
            const expected = {
                error: true,
                status: 403,
            };
            const actual = await productController.edit({admin: null});
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
        });
    
        it('Checks that barcode exists', async () => {
            const expected = {
                error: true,
                status: 400,
                body: 'validation/barcode',
            };
            const actual = await productController.edit({admin: {}}, undefined);
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
            const actual = await productController.edit({admin: {}}, 'notanumber');
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
            const actual = await productController.edit({admin: {}}, '01234', 1234);
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
            const actual = await productController.edit({admin: {}}, '01234', 'category', 1234);
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
            const actual = await productController.edit({admin: {}}, '01234', 'category', 'freeText', 'notanumber');
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
            const actual = await productController.edit({admin: {}}, '01234', 'category', 'freeText', '01234', 1234);
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
            const actual = await productController.edit({admin: {}}, '01234', 'category', 'freeText', '01234', 'brand', 1234);
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
            const actual = await productController.edit({admin: {}}, '01234', 'category', 'freeText', '01234', 'brand', 'name', 'notanumber');
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
            assert.strictEqual(actual.body, expected.body);
        });
        
        it('Checks that product exists', async () => {
            const expected = {
                error: true,
                status: 404,
                body: 'existence/barcode',
            };
            const barcode = '01234';
            const category = 'category';
            const freeText = 'freeText';
            const price = '10.00';
            const brand = 'brand';
            const name = 'name';
            const studentDiscount = '5.0';
            const actual = await productController.edit({admin: {}}, barcode, category, freeText, price, brand, name, studentDiscount, {
                db: {
                    models: {
                        product: {
                            update: () => {
                                return [0];
                            },
                        },
                    },
                },
            });
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
            assert.strictEqual(actual.body, expected.body);
        });
    
        it('Edits a product', async () => {
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
            const actual = await productController.edit({admin: {}}, barcode, category, freeText, price, brand, name, studentDiscount, {
                db: {
                    models: {
                        product: {
                            update: (values, options) => {
                                assert.strictEqual(values.category, category);
                                assert.strictEqual(values.freeText, freeText);
                                assert.strictEqual(values.price, price);
                                assert.strictEqual(values.brand, brand);
                                assert.strictEqual(values.name, name);
                                assert.strictEqual(values.studentDiscount, studentDiscount);
                                assert.strictEqual(options.where.barcode, barcode);
                                return [1];
                            },
                        },
                    },
                },
            });
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
        });
    });
    
    describe('search', () => {
        const ops = {
            or: '$or$',
            substring: '$substring$',
        };
    
        describe('Simple', () => {
            it('Works without parameters', async () => {
                let calledFindAll = false;
                await productController.search(undefined, undefined, undefined, undefined, {
                    db: {
                        Sequelize: {
                            Op: ops,
                        },
                        models: {
                            product: {
                                findAll: () => {calledFindAll = true;},
                                count: () => 1,
                            },
                        },
                    },
                });
                assert.strictEqual(calledFindAll, true);
            });
        });
    
        describe('Sort', () => {
            it('Sorts ascending', async () => {
                let calledFindAll = false;
                await productController.search('category=asc', undefined, undefined, undefined, {
                    db: {
                        Sequelize: {
                            Op: ops,
                        },
                        models: {
                            product: {
                                findAll: options => {
                                    calledFindAll = true;
                                    assert.strictEqual(options.order.length, 1);
                                    assert.strictEqual(options.order[0].length, 2);
                                    assert.strictEqual(options.order[0][0], 'category');
                                    assert.strictEqual(options.order[0][1], 'ASC');
                                },
                                count: () => 1,
                            },
                        },
                    },
                });
                assert.strictEqual(calledFindAll, true);
            });
            it('Sorts descending', async () => {
                let calledFindAll = false;
                await productController.search('category=Desc', undefined, undefined, undefined, {
                    db: {
                        Sequelize: {
                            Op: ops,
                        },
                        models: {
                            product: {
                                findAll: options => {
                                    calledFindAll = true;
                                    assert.strictEqual(options.order.length, 1);
                                    assert.strictEqual(options.order[0].length, 2);
                                    assert.strictEqual(options.order[0][0], 'category');
                                    assert.strictEqual(options.order[0][1], 'DESC');
                                },
                                count: () => 1,
                            },
                        },
                    },
                });
                assert.strictEqual(calledFindAll, true);
            });
        
            it('Sorts complex', async () => {
                let calledFindAll = false;
                await productController.search('category=asc,name=desc', undefined, undefined, undefined, {
                    db: {
                        Sequelize: {
                            Op: ops,
                        },
                        models: {
                            product: {
                                findAll: options => {
                                    calledFindAll = true;
                                    assert.strictEqual(options.order.length, 2);
                                    assert.strictEqual(options.order[0].length, 2);
                                    assert.strictEqual(options.order[0][0], 'category');
                                    assert.strictEqual(options.order[0][1], 'ASC');
                                    assert.strictEqual(options.order[1][0], 'name');
                                    assert.strictEqual(options.order[1][1], 'DESC');
                                },
                                count: () => 1,
                            },
                        },
                    },
                });
                assert.strictEqual(calledFindAll, true);
            });
        });
    
        describe('Search', () => {
            it('Doesn\'t filter if not given', async () => {
                let calledFindAll = false;
                await productController.search(undefined, '', undefined, undefined, {
                    db: {
                        Sequelize: {
                            Op: ops,
                        },
                        models: {
                            product: {
                                findAll: options => {
                                    calledFindAll = true;
                                    assert.deepStrictEqual(options.where, {});
                                },
                                count: () => 1,
                            },
                        },
                    },
                });
                assert.strictEqual(calledFindAll, true);
            });
    
            it('Looks for substrings if given', async () => {
                let calledFindAll = false;
                const searchText = 'foo';
                await productController.search(undefined, searchText, undefined, undefined, {
                    db: {
                        Sequelize: {
                            Op: ops,
                        },
                        models: {
                            product: {
                                findAll: options => {
                                    calledFindAll = true;
                                    assert.deepStrictEqual(options.where, {
                                        [ops.or]: {
                                            barcode: {
                                                [ops.substring]: searchText,
                                            },
                                            category: {
                                                [ops.substring]: searchText,
                                            },
                                            freeText: {
                                                [ops.substring]: searchText,
                                            },
                                            brand: {
                                                [ops.substring]: searchText,
                                            },
                                            name: {
                                                [ops.substring]: searchText,
                                            },
                                        },
                                    });
                                },
                                count: () => 1,
                            },
                        },
                    },
                });
                assert.strictEqual(calledFindAll, true);
            });
        });
        
        describe('Pagination', () => {
            it('Uses first page if not given', async () => {
                let calledFindAll = false;
                const pageSize = 20;
                await productController.search(undefined, undefined, undefined, pageSize, {
                    db: {
                        Sequelize: {
                            Op: ops,
                        },
                        models: {
                            product: {
                                findAll: options => {
                                    calledFindAll = true;
                                    assert.strictEqual(options.limit, pageSize);
                                    assert.strictEqual(options.offset, 0);
                                },
                                count: () => 1,
                            },
                        },
                    },
                });
                assert.strictEqual(calledFindAll, true);
            });
            
            it('Calculates the page correctly', async () => {
                let calledFindAll = false;
                const pageSize = 20;
                const pageNumber = 7;
                await productController.search(undefined, undefined, pageNumber, pageSize, {
                    db: {
                        Sequelize: {
                            Op: ops,
                        },
                        models: {
                            product: {
                                findAll: options => {
                                    calledFindAll = true;
                                    assert.strictEqual(options.limit, pageSize);
                                    assert.strictEqual(options.offset, pageSize * pageNumber);
                                },
                                count: () => 1,
                            },
                        },
                    },
                });
                assert.strictEqual(calledFindAll, true);
            });
        });
    });

    describe('destroy', () => {
        it('Checks that requesting user exists', async () => {
            const expected = {
                error: true,
                status: 403,
            };
            const actual = await productController.destroy();
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
        });
    
        it('Checks that requesting user is an admin', async () => {
            const expected = {
                error: true,
                status: 403,
            };
            const actual = await productController.destroy({admin: null});
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
        });
    
        it('Checks that barcode exists', async () => {
            const expected = {
                error: true,
                status: 400,
                body: 'validation/barcode',
            };
            const actual = await productController.destroy({admin: {}}, undefined);
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
            const actual = await productController.destroy({admin: {}}, 'notanumber');
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
            assert.strictEqual(actual.body, expected.body);
        });

        it('Destroys images', async () => {
            const expected = {
                error: false,
                status: 200,
            };
            const barcode = '01234';
            const transaction = {};
            let calledDestroy = false;
            const actual = await productController.destroy({admin: {}}, barcode, {
                db: {
                    sequelize: {
                        transaction: cb => cb(transaction),
                    },
                    models: {
                        image: {
                            destroy: options => {
                                calledDestroy = true;
                                assert.strictEqual(options.where.productBarcode, barcode);
                                assert.strictEqual(options.transaction, transaction);
                            },
                        },
                        product: {
                            destroy: () => null,
                        },
                        storeProduct: {
                            destroy: () => null,
                        },
                    },
                },
            });
            assert.strictEqual(calledDestroy, true);
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
        });
        
        it('Destroys product', async () => {
            const expected = {
                error: false,
                status: 200,
            };
            const barcode = '01234';
            const transaction = {};
            let calledDestroy = false;
            const actual = await productController.destroy({admin: {}}, barcode, {
                db: {
                    sequelize: {
                        transaction: cb => cb(transaction),
                    },
                    models: {
                        image: {
                            destroy: () => null,
                        },
                        product: {
                            destroy: options => {
                                calledDestroy = true;
                                assert.strictEqual(options.where.barcode, barcode);
                                assert.strictEqual(options.transaction, transaction);
                            },
                        },
                        storeProduct: {
                            destroy: () => null,
                        },
                    },
                },
            });
            assert.strictEqual(calledDestroy, true);
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
        });
        
        it('Destroys storeProduct', async () => {
            const expected = {
                error: false,
                status: 200,
            };
            const barcode = '01234';
            const transaction = {};
            let calledDestroy = false;
            const actual = await productController.destroy({admin: {}}, barcode, {
                db: {
                    sequelize: {
                        transaction: cb => cb(transaction),
                    },
                    models: {
                        image: {
                            destroy: () => null,
                        },
                        product: {
                            destroy: () => null,
                        },
                        storeProduct: {
                            destroy: options => {
                                calledDestroy = true;
                                assert.strictEqual(options.where.productBarcode, barcode);
                                assert.strictEqual(options.transaction, transaction);
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

    describe('setImages', () => {
        it('Checks that requesting user exists', async () => {
            const expected = {
                error: true,
                status: 403,
            };
            const actual = await productController.setImages();
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
        });
    
        it('Checks that requesting user is an admin', async () => {
            const expected = {
                error: true,
                status: 403,
            };
            const actual = await productController.setImages({admin: null});
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
        });
    
        it('Checks that barcode exists', async () => {
            const expected = {
                error: true,
                status: 400,
                body: 'validation/barcode',
            };
            const actual = await productController.setImages({admin: {}}, undefined);
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
            const actual = await productController.setImages({admin: {}}, 'notanumber');
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
            assert.strictEqual(actual.body, expected.body);
        });

        it('Deletes images', async () => {
            const expected = {
                error: false,
                status: 200,
            };
            const barcode = 7;
            const transaction = {};
            let calledDestroy = false;
            const actual = await productController.setImages({admin: {}}, barcode, null, {
                db: {
                    sequelize: {
                        transaction: cb => cb(transaction),
                    },
                    models: {
                        image: {
                            destroy: options => {
                                calledDestroy = true;
                                assert.strictEqual(options.where.productBarcode, barcode);
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

        it('Creates new images', async () => {
            const expected = {
                error: false,
                status: 200,
            };
            const barcode = 7;
            const transaction = {};
            const url = 'http://www.google.com/';
            let calledCreate = false;
            const actual = await productController.setImages({admin: {}}, barcode, [url], {
                db: {
                    sequelize: {
                        transaction: cb => cb(transaction),
                    },
                    models: {
                        image: {
                            destroy: () => null,
                            bulkCreate: (values, options) => {
                                calledCreate = true;
                                assert.strictEqual(values.length, 1);
                                assert.strictEqual(values[0].url, url);
                                assert.strictEqual(values[0].productBarcode, barcode);
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
