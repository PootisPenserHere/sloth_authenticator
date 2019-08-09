const assert = require('chai').assert;

const fileService = require('../../src/service/file');

describe('src.service.file.readFile()', function() {
    let data;

    it('Reads the license at the root of the project and returns its contents as a buffer', async function() {
        data = await fileService.readFile('./LICENSE');
        assert.isNotNull(data);
    });

    it('Searches the read file for a common string "Copyright" found in most licenses', async function() {
        assert.include(data.toString(), 'Copyright')
    });

    it('Checks that the file read is a buffer', async function() {
        assert.instanceOf(data, Buffer);
    });
});