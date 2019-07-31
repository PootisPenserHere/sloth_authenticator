"use strict";

/**
 * Generic service to access cryptography based services
 *
 * @module cryptoService
 */

const crypto = require('crypto');

/**
 * Returns a cryptographically secure string with the desired length in hex format
 *
 * NOTE: The output will in most cases be larger than the argument sent in lengthInBytes
 * due to it being converted to hex
 *
 * @param {int} [lengthInBytes] Length in bytes of the randomly generated string defaults to 32
 * @returns {Promise<string>} A hex representation of the random bytes
 */
async function secureRandomString(lengthInBytes = 32) {
    return await crypto.randomBytes(lengthInBytes).toString('hex');
}

module.exports.secureRandomString = secureRandomString;
