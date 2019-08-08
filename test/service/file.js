const chai = require('chai');
const fileService = require('../../src/service/file');

const assert = chai.assert;

describe('readFile()', function() {
    it('Reads the license at the root of the project and returns its contents as a buffer', async function() {
        let fileData = await fileService.readFile('./LICENSE');
        assert.isNotNull(fileData);
    });
});