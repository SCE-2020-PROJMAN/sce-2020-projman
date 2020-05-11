import assert from 'assert';
import customerController from '../../../../src/api/controller/customer';

describe('customer controller', () => {
    describe('setStatus', () => {
        it('Checks that requesting exists', async () => {
            const expected = {
                error: true,
                status: 403,
            };
            const actual = await customerController.setStatus();
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
        });
    
        it('Checks that requesting user is an admin', async () => {
            const expected = {
                error: true,
                status: 403,
            };
            const actual = await customerController.setStatus({admin: null});
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
        });
    
        it('Checks that userEmail is valid', async () => {
            const expected = {
                error: true,
                status: 400,
                body: 'validation/userEmail',
            };
            const actual = await customerController.setStatus({admin: {}}, 'notanemail');
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
            assert.strictEqual(actual.body, expected.body);
        });
        
        it('Checks that isStudent is boolean', async () => {
            const expected = {
                error: true,
                status: 400,
                body: 'validation/isStudent',
            };
            const actual = await customerController.setStatus({admin: {}}, 'some@email.com', 'true');
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
            assert.strictEqual(actual.body, expected.body);
        });
        
        it('Checks that customer was found', async () => {
            const expected = {
                error: true,
                status: 404,
                body: 'existence/userEmail',
            };
            const actual = await customerController.setStatus({admin: {}}, 'some@email.com', true, {
                db: {
                    models: {
                        customer: {
                            update: () => [0],
                        },
                    },
                },
            });
            assert.strictEqual(actual.error, expected.error);
            assert.strictEqual(actual.status, expected.status);
            assert.strictEqual(actual.body, expected.body);
        });
        
        it('Updates the customer', async () => {
            const expected = {
                error: false,
                status: 200,
            };
            const email = 'some@email.com';
            const isStudent = true;
            const actual = await customerController.setStatus({admin: {}}, email, isStudent, {
                db: {
                    models: {
                        customer: {
                            update: (values, options) => {
                                assert.strictEqual(values.isStudent, isStudent);
                                assert.strictEqual(options.where.userEmail, email);
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
});
