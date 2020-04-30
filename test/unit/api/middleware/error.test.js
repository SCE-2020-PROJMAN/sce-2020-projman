import assert from 'assert';
import errorMiddleware from '../../../../src/api/middleware/error';

function createRequest() {
    const obj = {};
    return obj;
}

function createResponse(onSend, headersSent) {
    const obj = {
        status: (status) => ({send: (data) => onSend(status, data) || (() => {})}),
        send: (data) => onSend(null, data) || (() => {}),
        headersSent: headersSent,
    };
    return obj;
}

describe('Error middleware', () => {
    it('Doesn\'t send anything if already sent', done => {
        errorMiddleware(
            new Error('Test error'),
            createRequest(),
            createResponse(() => {
                done(new Error('Does send'));
            }, true)
        );
        done();
    });

    it('Sends an error if not sent yet', done => {
        errorMiddleware(
            new Error('Test error'),
            createRequest(),
            createResponse(status => {
                try {
                    assert.strictEqual(status, 500);
                    done();
                } catch(err) {
                    done(err);
                }
            }, false)
        );
    });
});
