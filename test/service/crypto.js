const assert = require('chai').assert;

const cryptoService = require('../../src/service/crypto');

describe('src.service.crypto.secureRandomString()', function() {
    let data;

    it('Verifies that the random output is a string', async function() {
        data = await cryptoService.secureRandomString(10);
        assert.isNotNull(data);
        assert.isString(data);
    });

    it('Compares the string to the asked length, it should be equal or larger  due to the bin2hex', async function() {
        assert.isAtLeast(data.length, 10);
    });

    it('Requests a random string without passing a length argument,  should get a string of default length', async function() {
        data = await cryptoService.secureRandomString();
        assert.isNotNull(data);
        assert.isString(data);
        assert.isAtLeast(data.length, 32);
    });
});


describe('src.service.crypto.hashPassword()', function() {
    it('Hashes a string with bcrypt, should return a string', async function() {
        let data = await cryptoService.hashPassword('cosa');
        assert.isNotNull(data);
        assert.isString(data);
        assert.isAtLeast(data.length, 6); // The first 6 characters define the algorithm version and salt cost
    });
});

describe('src.service.crypto.verifyHashedPassword()', function() {
    it('Compares a hashed password against its plain text equivalent, should return true', async function() {
        let hashed = await cryptoService.hashPassword('cosa');
        let data = await cryptoService.verifyHashedPassword('cosa', hashed);
        assert.isNotNull(data);
        assert.isTrue(data);
    });

    it('Compares a hashed password against an invalid plain text string, should return false', async function() {
        let hashed = await cryptoService.hashPassword('cosa');
        let data = await cryptoService.verifyHashedPassword('thing', hashed);
        assert.isNotNull(data);
        assert.isFalse(data);
    });
});
