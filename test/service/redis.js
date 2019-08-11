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
let countKey = 'count';

describe('src.service.redis.setKey()', function() {
    it('Saves a string in redis, it should have the default ttl', async function () {
        let data = await redisService.setKey(keyWithoutTtl, stringValue);
        assert.isNotNull(data);
        assert.equal(data, 'OK'); // Default response on success

        let keyTtl = await redisService.getTtl(keyWithoutTtl);
        assert.isNotNull(keyTtl);
        assert.isNumber(keyTtl);
        assert.isAtMost(keyTtl, parseInt(process.env.REDIS_DEFAULT_TTL));
        assert.isAtLeast(keyTtl, parseInt(process.env.REDIS_DEFAULT_TTL) - 1);
    });

    it('Saves a string in redis with a predefined ttl', async function() {
        let data = await redisService.setKey(keyWithTtl, stringValue, ttl);
        assert.isNotNull(data);
        assert.equal(data, 'OK'); // Default response on success

        let keyTtl = await redisService.getTtl(keyWithTtl);
        assert.isNotNull(keyTtl);
        assert.isNumber(keyTtl);
        assert.isAtMost(keyTtl, ttl);
        assert.isAtLeast(keyTtl, ttl - 1);
    });
});

describe('src.service.redis.getTtl()', function() {
    it('Reads the ttl of a key, should return an int above 0', async function () {
        let data = await redisService.getTtl(keyWithoutTtl);
        assert.isNotNull(data);
        assert.isNumber(data);
        assert.isAtLeast(data, 1);
    });
});

describe('src.service.redis.getKey()', function() {
    it('Reads a key in redis', async function() {
        let data = await redisService.getKey(keyWithTtl);
        assert.isNotNull(data);
        assert.equal(data, stringValue);
    });
});

describe('src.service.redis.deleteKey()', function() {
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
});

describe('src.service.redis.setJsonKey()', function() {
    it('Saves an object in redis, it should have the default ttl', async function() {
        let data = await redisService.setJsonKey(keyWithoutTtl, objectValue);
        assert.isNotNull(data);
        assert.equal(data, 'OK'); // Default response on success

        let keyTtl = await redisService.getTtl(keyWithoutTtl);
        assert.isNotNull(keyTtl);
        assert.isNumber(keyTtl);
        assert.isAtMost(keyTtl, parseInt(process.env.REDIS_DEFAULT_TTL));
        assert.isAtLeast(keyTtl, parseInt(process.env.REDIS_DEFAULT_TTL) - 1);
    });

    it('Saves an object in redis with a ttl', async function() {
        let data = await redisService.setJsonKey(keyWithTtl, objectValue, ttl);
        assert.isNotNull(data);
        assert.equal(data, 'OK'); // Default response on success

        let keyTtl = await redisService.getTtl(keyWithTtl);
        assert.isNotNull(keyTtl);
        assert.isNumber(keyTtl);
        assert.isAtMost(keyTtl, ttl);
        assert.isAtLeast(keyTtl, ttl - 1);
    });
});

describe('src.service.redis.getJsonKey()', function() {
    it('Reads an object in redis and compares it to the saved one', async function() {
        let data = await redisService.getJsonKey(keyWithoutTtl);
        assert.isNotNull(data);
        assert.deepEqual(data, objectValue);
    });
});
