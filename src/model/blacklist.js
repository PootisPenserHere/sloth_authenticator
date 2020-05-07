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
const jwtModel = require('./jwt');

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

/**
 * Add a token to the blacklist so that in further requests it won't be accepted as a
 * valid token even if its attributes and signature are correct
 *
 * @function
 * @name revokeToken
 * @param {string} token The jwt to be blocked
 * @returns {Promise<{status: string, message: string}>}
 */
async function revokeToken(token) {
    await assert.isNotNull(token, "The token shouldn't be null");
    await assert.isNotEmpty(token, "The token shouldn't be empty");

        let decodedToken = await jwtModel.decodeToken(token);

        // TODO create custom error for to distinguish between invalid token and already blocked tokken
        if(await lookUpByJti(decodedToken.jti)) {
            throw Error("The token is already blocked.");
        }

        await blockTokenByJti(decodedToken.jti, decodedToken.exp + 1);
}

module.exports.lookUpByJti = lookUpByJti;
module.exports.revokeToken = revokeToken;
