const assert = require('chai').assert;

const postgresService = require('../../src/service/postgres');

// Will close the postgres connection once all the tests are done
after(function (done) {
    postgresService.connection.close();
    done();
});

describe('src.service.postgres.connection()', function() {
    it('Attempts a connection to the database, should return the passed value in the select statement', async function() {
        let data = await postgresService.connection.query("SELECT 1 AS cosa");
        assert.isNotNull(data);
        assert.deepEqual(data[0][0], {"cosa":1});
    });
});
