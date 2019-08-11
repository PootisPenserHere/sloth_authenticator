const assert = require('chai').assert;

const redisService = require('../../src/service/redis');

// Will close the redis connection once all the tests are done
after(function (done) {
    redisService.closeConnection();
    done();
});

let keyWithoutTtl = 'stringWithoutTtl';
let keyWithTtl = 'keyWithTtl';
let ttl = 10;
let stringValue = 'random value!';
let objectValue = {'one': 1, 'string': 'thing'};

describe('src.service.redis.readFile()', function() {
    it('Saves a string in redis, it should have the default ttl', async function() {
        let data = await redisService.setKey(keyWithoutTtl, stringValue);
        assert.isNotNull(data);
        assert.equal(data, 'OK'); // Default response on success
    });

    it('Reads the ttl of a key saved without sending a ttl, should return an int with the default ttl', async function() {
        let data = await redisService.getTtl(keyWithoutTtl);
        assert.isNotNull(data);
        assert.isNumber(data);
        assert.isAtLeast(data, 1);
    });

    it('Saves a string in redis with a ttl', async function() {
        let data = await redisService.setKey(keyWithTtl, stringValue, ttl);
        assert.isNotNull(data);
        assert.equal(data, 'OK'); // Default response on success
    });

    it('Reads a key in redis', async function() {
        let data = await redisService.getKey(keyWithTtl);
        assert.isNotNull(data);
        assert.equal(data, stringValue);
    });

    it('Deletes a key in redis', async function() {
        // First ensure that the key is exists
        let verifyingExistence = await redisService.getKey(keyWithTtl);
        assert.isNotNull(verifyingExistence);
        assert.equal(verifyingExistence, stringValue);

        // Delete the key and check the response
        let data = await redisService.deleteKey(keyWithTtl);
        assert.isNotNull(data);
        assert.isNumber(data);
        assert.equal(data, 1); // Default response on success

        // Ensure that the key no longer exists in redis
        let verifyingDelete = await redisService.getKey(keyWithTtl);
        assert.isNull(verifyingDelete); // No key should have been found
    });

    it('Saves an object in redis, it should have the default ttl', async function() {
        let data = await redisService.setJsonKey(keyWithoutTtl, objectValue);
        assert.isNotNull(data);
        assert.equal(data, 'OK'); // Default response on success
    });

    it('Saves an object in redis with a ttl', async function() {
        let data = await redisService.setJsonKey(keyWithoutTtl, objectValue, ttl);
        assert.isNotNull(data);
        assert.equal(data, 'OK'); // Default response on success
    });
});
