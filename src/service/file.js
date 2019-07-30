"use strict";

const fs = require('fs');

/**
 * Reads a file from disk and its contents as a buffer
 *
 * @param {string} filePath The disk path to the file
 * @returns {Promise<buffer>}
 */
async function readFile(filePath) {
    // TODO wrap this function in a cache layer
    return await fs.readFileSync(filePath);
}

module.exports.readFile = readFile;
