const assert = require('chai').assert;

const fileService = require('../../src/service/file');

describe('src.service.file.readFile()', function() {
    let fileData;

    it('Reads the license at the root of the project and returns its contents as a buffer', async function() {
        fileData = await fileService.readFile('./LICENSE');
        assert.isNotNull(fileData);
    });

    it('Searches the read file for a common string "Copyright" found in most licenses', async function() {
        assert.include(fileData.toString(), 'Copyright')
    });

    it('Checks that the file read is a buffer', async function() {
        assert.instanceOf(fileData, Buffer);
    });
});