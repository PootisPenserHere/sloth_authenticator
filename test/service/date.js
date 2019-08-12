const assert = require('chai').assert;

const dateService = require('../../src/service/date');

describe('src.service.date.secondsLeftTillTimestamp()', function() {
    let data;
    let futureTimestamp = (Math.floor(Date.now() / 1000)) + 10;
    let pastTimestamp= 1565371947;

    it('Sends timestamp not yet passed, expecting a positive number in response', async function() {
        data = await dateService.secondsLeftTillTimestamp(futureTimestamp);
        assert.isNumber(data);
        assert.isAbove(data, 0);
        assert.isAtMost(data, 10); // As we added 10 extra seconds to the timestamp
    });

    it('Sends past timestamp, expecting negative number in response', async function() {
        data = await dateService.secondsLeftTillTimestamp(pastTimestamp);
        assert.isNumber(data);
        assert.isBelow(data, 0);
    });
});
