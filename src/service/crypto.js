"use strict";

/**
 * Generic service to access cryptography based services
 *
 * @module cryptoService
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');

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

/**
 * Securely protects a password for cold storage
 *
 * @function
 * @name hashPassword
 * @param {string} plaintextPassword The user's password in plain text
 * @returns {Promise<string>} A hashed version of the provided plain text password
 */
async function hashPassword(plaintextPassword){
    return await new Promise((resolve, reject) => {
        bcrypt.hash(plaintextPassword, parseInt(process.env.SALT_COST), function (err, hash) {
            /* istanbul ignore next */
            if (err) reject(err);
            resolve(hash)
        });
    });
}

/**
 * Compares the plaintext password provided against the hashed one to determine if they match
 *
 * @function
 * @name verifyHashedPassword
 * @param {string} plaintextPassword The user's password in plain text
 * @param {string} hashedPassword The user's password as stored in the database
 * @returns {Promise<boolean>}
 */
async function verifyHashedPassword(plaintextPassword, hashedPassword){
    return await new Promise((resolve, reject) => {
        bcrypt.compare(plaintextPassword, hashedPassword, function (err, res) {
            /* istanbul ignore next */
            if (err) reject(err);
            resolve(res)
        });
    });
}

module.exports.secureRandomString = secureRandomString;
module.exports.hashPassword = hashPassword;
module.exports.verifyHashedPassword = verifyHashedPassword;
