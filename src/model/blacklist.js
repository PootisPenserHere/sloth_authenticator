"use strict";

/**
 * A stateful approach to keep track of the tokens that have been blocked and must not
 * be allowed to pass the client applications
 *
 * @module blacklistModel
 */

const assert = require('chai').assert;
const redisService = require('../service/redis');
const dateService = require('../service/date');
const loggerService = require('../service/logger');

/**
 * Generates a unique and repeatable string based on the token id to reference the token
 * being blocked or to find if a token is blocked
 *
 * @function
 * @name blockedTokenByJtiCacheKeyGenerator
 * @param {string} tokenId The id of the token
 * @returns {Promise<string>} A string to be used as the key to store the blocked token id
 */
async function blockedTokenByJtiCacheKeyGenerator(tokenId) {
    await assert.isString(tokenId, "The token id (jti) should be a string");
    await assert.isNotNull(tokenId, "The token id (jti) shouldn't be null");
    await assert.isNotEmpty(tokenId, "The token id (jti) shouldn't be empty");

    return `blacklistedToken-${tokenId}`;
}

/**
 * Checks the cache against a given token to determine if the token has been blocked or not
 *
 * @function
 * @name tokenIsNotBlocked
 * @param {string} tokenId The id of the token
 * @returns {Promise<boolean>} True if the token is blocked false if not blacklisted
 */
async function lookUpByJti(tokenId) {
    await assert.isString(tokenId, "The token id (jti) should be a string");
    await assert.isNotNull(tokenId, "The token id (jti) shouldn't be null");
    await assert.isNotEmpty(tokenId, "The token id (jti) shouldn't be empty");

    return !!(await redisService.getKey(await blockedTokenByJtiCacheKeyGenerator(tokenId)))
}

/**
 *
 * @function
 * @name blockTokenByJti
 * @param {string} jti The id of the jwt in the jti attribute
 * @param {int} exp The expiration time of the token or the time it should be blocked
 * @returns {Promise<string>}
 */
async function blockTokenByJti(jti, exp) {
    return await redisService.setKey(
        await blockedTokenByJtiCacheKeyGenerator(jti),
        jti,
        await dateService.secondsLeftTillTimestamp(exp) + 10
    );
}

module.exports.lookUpByJti = lookUpByJti;
module.exports.blockTokenByJti = blockTokenByJti;
