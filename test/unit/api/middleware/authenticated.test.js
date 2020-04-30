import assert from 'assert';
import authenticatedMiddleware from '../../../../src/api/middleware/authenticated';

function createRequest(headers) {
    const obj = {
        headers: headers || {},
    };
    return obj;
}

function createResponse(onSend) {
    const obj = {
        status: (status) => ({send: (data) => onSend(status, data) || (() => {})}),
        send: (data) => onSend(null, data) || (() => {}),
    };
    return obj;
}

function createModels(onFindAuthToken) {
    function createModel(onFind) {
        const obj = {
            findOne: onFind || (() => {}),
        };
        return obj;
    }

    const obj = {
        authToken: createModel(onFindAuthToken),
        user: createModel(),
    };
    return obj;
}

describe('Authenticated middleware', () => {
    it('Exits if no authToken', done => {
        authenticatedMiddleware()(createRequest(), createResponse((status, data) => {
            try {
                assert.strictEqual(status, 403);
                assert.strictEqual(data, 'Authorization header required');
                done();
            } catch(err) {
                done(err);
            }
        }), () => {
            done(new Error('Did not exit'));
        });
    });

    it('Exits if authToken not found', done => {
        const authToken = 'c3ce7179-1888-4dcc-a31f-8f9c7a79ba4e';
        authenticatedMiddleware(
            createModels(() => {
                return null; // simulate not found
            })
        )(
            createRequest({authorization: authToken}),
            createResponse((status, data) => {
                try {
                    assert.strictEqual(status, 403);
                    assert.strictEqual(data, 'not found');
                    done();
                } catch(err) {
                    done(err);
                }
            }),
            () => {
                done(new Error('Did not exit'));
            }
        );
    });

    it('Proceeds if authToken is good', done => {
        const authToken = 'c3ce7179-1888-4dcc-a31f-8f9c7a79ba4e';
        authenticatedMiddleware(
            createModels(() => {
                return {};
            })
        )(
            createRequest({authorization: authToken}),
            createResponse(),
            () => {
                done();
            }
        );
    });

    it('Populates `req.requestingUser` if authToken is good', done => {
        const authToken = 'c3ce7179-1888-4dcc-a31f-8f9c7a79ba4e';
        const authTokenUser = {};
        const request = createRequest({authorization: authToken});
        authenticatedMiddleware(
            createModels(options => {
                if (options.where.id === authToken) {
                    return {
                        user: authTokenUser,
                    };
                }
                return null;
            })
        )(
            request,
            createResponse(),
            () => {
                try {
                    assert.strictEqual(request.requestingUser, authTokenUser);
                    done();
                } catch(err) {
                    done(err);
                }
            }
        );
    });
});
