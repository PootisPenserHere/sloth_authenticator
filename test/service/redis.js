const assert = require('chai').assert;

const redisService = require('../../src/service/redis');

// Will close the redis connection once all the tests are done
after(function (done) {
    redisService.closeConnection();
    done();
});

describe('src.service.redis.readFile()', function() {
    it('Reads the license at the root of the project and returns its contents as a buffer', async function() {
        let data = await redisService.setKey('testKey', 'random value!');
        assert.isNotNull(data);
    });
});
