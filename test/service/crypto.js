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
