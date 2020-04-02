import crypto from 'crypto';
import util from 'util';

const saltLength = 16; // in bytes
const partsSeparator = '$';

async function hashWithSalt(srcData, salt, saltRounds) {
    const keyLength = 64; // in bytes
    const digestAlgorithm = 'sha512';
    const derivedKey = await util.promisify(crypto.pbkdf2)(srcData, salt, Number(saltRounds), keyLength, digestAlgorithm);
    const hash = derivedKey.toString('hex');
    return hash;
}

/**
 * 
 * @param {*} srcData 
 * @param {Number} saltRounds The higher the better, but slower
 */
async function hash(srcData, saltRounds) {
    const salt = crypto.randomBytes(saltLength).toString('hex');
    const hash = await hashWithSalt(srcData, salt, saltRounds);
    return [saltRounds, salt, hash].join(partsSeparator);
}

async function compare(unhashedLeft, hashedRight) {
    const rightParts = hashedRight.split(partsSeparator);
    const saltRounds = rightParts[0];
    const rightSalt = rightParts[1];
    const rightHash = rightParts.slice(2).join(partsSeparator);

    const leftHash = await hashWithSalt(unhashedLeft, rightSalt, saltRounds);

    return crypto.timingSafeEqual(Buffer.from(leftHash), Buffer.from(rightHash));
}

export default {
    hash,
    compare,
};
