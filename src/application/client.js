"use strict";

/**
 * Contains the business based logic to handle the third party clients authentication needs
 *
 * @module clientApplication
 */

const assert = require('chai').assert;

const jwt = require('../model/jwt');
const fileService = require('../service/file');
const dateService = require('../service/date');
const redisService = require('../service/redis');
const loggerService = require('../service/logger');

/**
 * New sync token signing to be used by client applications
 *
 * @function
 * @name signSyncToken
 * @param {object} [payload] Contains any data that will be added to the token's payload
 * @param {int} [expirationTime] Defines the expiration time of the token, if not sent the token won't have an expiration
 * @returns {Promise<{token: string, status: string, message, string}|{status: string, message, string}>}
 */
async function signSyncToken(payload = {}, expirationTime = 0) {
    await assert.isNotNull(payload, "The payload shouldn't be null");
    await assert.isAtLeast(expirationTime, 0, "The expirationTime must be set to 0 or higher");

    try {
        return {
            "token": await jwt.signNewSyncToken(process.env.JWT_SECONDARY_SECRET, payload, expirationTime),
            "status": "success",
            "message": "Token created successfully."
        }
    } catch (err) {
        loggerService.logger.error(`error at clientApplication.signSyncToken caused by ${err}`);
        return {
            "status": "error",
            "message": "There was an error creating the token, if the problem persist contact the system administrator."
        }
    }
}

/**
 * Decodes a sync token used by a client application
 *
 * @function
 * @name decodeSyncToken
 * @param {string} token The jwt to be validated
 * @returns {Promise<{payload: string, status: string, message: string}|{status: string, message: string}>}
 */
async function decodeSyncToken(token) {
    await assert.isNotNull(token, "The token shouldn't be null");
    await assert.isNotEmpty(token, "The token shouldn't be empty");

    try {
        let tokenPayload = await jwt.verifySyncToken(token, process.env.JWT_SECONDARY_SECRET);

        if(await tokenIsBlocked(tokenPayload.jti)) {
            return {
                "status": "error",
                "message": "The token is invalid."
            }
        }

        return {
            "payload": tokenPayload,
            "status": "success",
            "message": "The token is valid."
        }
    } catch (err) {
        loggerService.logger.error(`error at clientApplication.decodeSyncToken caused by ${err}`);
        return {
            "status": "error",
            "message": "The token is invalid."
        }
    }
}

/**
 * New async token signing to be used by client applications
 *
 * @function
 * @name signAsyncToken
 * @param {object} [payload] Contains any data that will be added to the token's payload
 * @param {int} [expirationTime] Defines the expiration time of the token, if not sent the token won't have an expiration
 * @returns {Promise<{token: string, status: string, message, string}|{status: string, message, string}>}
 */
async function signAsyncToken(payload = {}, expirationTime = 0) {
    await assert.isNotNull(payload, "The payload shouldn't be null");
    await assert.isAtLeast(expirationTime, 0, "The expirationTime must be set to 0 or higher");

    try {
        /*
         * If the rsa key has been encrypted the sign method will take the key and its passphrase
         * as an object
         */
        let cert; // TODO add a verification to check that the file's contents are a valid private key
        if(process.env.JWR_SECONDARY_RSA_KEY_PASSWORD) {
            cert = {
                'key': await fileService.readFile(process.env.JWT_SECONDARY_RSA_PRIVATE_KEY),
                'passphrase': process.env.JWR_SECONDARY_RSA_KEY_PASSWORD
            }
        } else {
            cert = await fileService.readFile(process.env.JWT_SECONDARY_RSA_PRIVATE_KEY)
        }

        return {
            "token": await jwt.signNewAsyncToken(cert, payload, expirationTime),
            "status": "success",
            "message": "Token created successfully."
        }
    } catch (err) {
        loggerService.logger.error(`error at clientApplication.signAsyncToken caused by ${err}`);
        return {
            "status": "error",
            "message": "There was an error creating the token, if the problem persist contact the system administrator."
        }
    }
}

/**
 * Decodes an async token used by a client application
 *
 * @function
 * @name decodeAsyncToken
 * @param {string} token The jwt to be validated
 * @returns {Promise<{payload: string, status: string, message: string}|{status: string, message: string}>}
 */
async function decodeAsyncToken(token) {
    await assert.isNotNull(token, "The token shouldn't be null");
    await assert.isNotEmpty(token, "The token shouldn't be empty");

    try {
        let cert = await fileService.readFile(process.env.JWT_SECONDARY_RSA_PUBLIC_KEY);
        let tokenPayload = await jwt.verifyAsyncToken(token, cert);

        if(await tokenIsBlocked(tokenPayload.jti)) {
            return {
                "status": "error",
                "message": "The token is invalid."
            }
        }

        return {
            "payload": tokenPayload,
            "status": "success",
            "message": "The token is valid."
        }
    } catch (err) {
        loggerService.logger.error(`error at clientApplication.decodeAsyncToken caused by ${err}`);
        return {
            "status": "error",
            "message": "The token is invalid."
        }
    }
}

/**
 * Generates a unique and repeatable string based on the token id to reference the token
 * being blocked or to find if a token is blocked
 *
 * @function
 * @name blockedTokenCacheKeyGenerator
 * @param {string} tokenId The id of the token
 * @returns {Promise<string>} A string to be used as the key to store the blocked token id
 */
async function blockedTokenCacheKeyGenerator(tokenId) {
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
 * @returns {Promise<boolean>}
 */
async function tokenIsBlocked(tokenId) {
    await assert.isString(tokenId, "The token id (jti) should be a string");
    await assert.isNotNull(tokenId, "The token id (jti) shouldn't be null");
    await assert.isNotEmpty(tokenId, "The token id (jti) shouldn't be empty");

    return !!(await redisService.getKey(await blockedTokenCacheKeyGenerator(tokenId)))
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

    try {
        let decodedToken = await jwt.decodeToken(token);

        if(await tokenIsBlocked(decodedToken.payload.jti)) {
            return {
                "status": "error",
                "message": "The token is already blocked."
            }
        }

        /*
         * The tokens are verified based on their signature type this is done to determine
         * if the token sent is still valid to the system and avoid precessing the ones
         * that have already expired or have the wrong signature
         *
         * As there are different versions of the used algorithms they're validated against
         * a part of their name, in this case looking for a match of the sync algorithm hs
         *
         * The input is ignored as the needed data already exists in the decodedToken variable
         */
        if(decodedToken.header.alg.indexOf("HS") > -1) {
            await jwt.verifySyncToken(token, process.env.JWT_SECONDARY_SECRET)
        } else{
            let cert = await fileService.readFile(process.env.JWT_SECONDARY_RSA_PUBLIC_KEY);
            await jwt.verifyAsyncToken(token, cert);
        }

        await redisService.setKey(
            await blockedTokenCacheKeyGenerator(decodedToken.payload.jti),
            decodedToken.payload.jti,
            await dateService.secondsLeftTillTimestamp(decodedToken.payload.exp) + 10
        );

        return {
            "status": "success",
            "message": "The token has been added to the blacklist."
        }
    } catch (err) {
        loggerService.logger.error(`error at clientApplication.decodeSyncToken caused by ${err}`);
        return {
            "status": "error",
            "message": "The token is invalid."
        }
    }
}

module.exports.signSyncToken = signSyncToken;
module.exports.decodeSyncToken = decodeSyncToken;
module.exports.signAsyncToken = signAsyncToken;
module.exports.decodeAsyncToken = decodeAsyncToken;
module.exports.revokeToken = revokeToken;
