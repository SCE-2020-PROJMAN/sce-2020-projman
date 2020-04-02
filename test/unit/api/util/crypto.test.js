import assert from 'assert';
import cryptoUtil from '../../../../src/api/util/crypto';

describe('cryptoUtil', () => {
    describe('compare', () => {
        it('Trivial', async () => {
            const unhashed = 'plaintext';
            const hashed = await cryptoUtil.hash(unhashed, 10);
            assert.ok(await cryptoUtil.compare(unhashed, hashed));
        });
    });
});
