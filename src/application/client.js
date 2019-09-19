"use strict";

/**
 * Contains the business based logic to handle the third party clients authentication needs
 *
 * @module clientApplication
 */

const assert = require('chai').assert;

const jwtModel = require('../service/jwt');
const blacklistModel = require('../model/blacklist');
const fileService = require('../service/file');
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
            "token": await jwtModel.signNewToken(process.env.JWT_SECONDARY_SECRET, payload, expirationTime),
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
            "token": await jwtModel.signNewToken(cert, payload, expirationTime),
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
 * Will decode a jwt regardless of the signature strategy and return its payload on
 * success
 *
 * @function
 * @name decodeToken
 * @param {string} token The jwt to be verified
 * @returns {Promise<{iat: int, exp: int, iss: string, jti: string}>}
 * @throws {JsonWebTokenError|NotBeforeError|TokenExpiredError}
 */
async function decodeToken(token) {
    await assert.isNotNull(token, "The token shouldn't be null");
    await assert.isNotEmpty(token, "The token shouldn't be empty");

    let decodedToken = await jwtModel.decodeToken(token);
    let tokenPayload;

    /*
     * The tokens are verified based on their signature type this is done to determine
     * if the token sent is still valid to the system and avoid precessing the ones
     * that have already expired or have the wrong signature
     *
     * As there are different versions of the used algorithms they're validated against
     * a part of their name, in this case looking for a match of the sync algorithm hs
     */
    if(decodedToken.header.alg.indexOf("HS") > -1) {
        tokenPayload = await jwtModel.verifyToken(token, process.env.JWT_SECONDARY_SECRET)
    } else{
        let cert = await fileService.readFile(process.env.JWT_SECONDARY_RSA_PUBLIC_KEY);
        tokenPayload = await jwtModel.verifyToken(token, cert);
    }

    return tokenPayload;
}

/**
 * Decodes and verify the integrity of the signature of tokens be it sync or async and returns
 * a output to be passed to the response body
 *
 * @function
 * @name verifyToken
 * @param {string} token The jwt to be verified
 * @returns {Promise<{iat: int, exp: int, iss: string, jti: string}|{status: string, message: string}>}
 */
async function verifyToken(token) {
    await assert.isNotNull(token, "The token shouldn't be null");
    await assert.isNotEmpty(token, "The token shouldn't be empty");

    try {
        let decodedToken = await decodeToken(token);

        if(!decodedToken || await blacklistModel.lookUpByJti(decodedToken.jti)) {
            return {
                "status": "error",
                "message": "The token is invalid."
            }
        }

        return {
            "payload": decodedToken,
            "status": "success",
            "message": "The token is valid."
        }

    } catch (err) {
        loggerService.logger.error(`error at clientApplication.verifyToken caused by ${err}`);
        return {
            "status": "error",
            "message": "The token is invalid."
        }
    }
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
        let decodedToken = await decodeToken(token);

        if(await blacklistModel.lookUpByJti(decodedToken.jti)) {
            return {
                "status": "error",
                "message": "The token is already blocked."
            }
        }

        await blacklistModel.blockTokenByJti(decodedToken.jti, decodedToken.exp);

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
module.exports.verifyToken = verifyToken;
module.exports.signAsyncToken = signAsyncToken;
module.exports.revokeToken = revokeToken;
