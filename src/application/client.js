"use strict";

/**
 * Contains the business based logic to handle the third party clients authentication needs
 *
 * @module clientApplication
 */

const assert = require('chai').assert;

const jwtModel = require('../model/jwt');
const blacklistModel = require('../model/blacklist');
const loggerService = require('../service/logger');

/**
 * Signs a new token according to the desired signature type
 *
 * @function
 * @name newToken
 * @param {object} [payload] Contains any data that will be added to the token's payload
 * @param {string} signatureType Either async or sync to define the type of algorithm used to sign the token
 * @param {int} [expirationTime] Defines the expiration time of the token, if not sent the token won't have an expiration
 * @returns {Promise<{token: string, status: string, message, string}|{status: string, message, string}>}
 */
async function newToken(payload = {}, signatureType, expirationTime = 0) {
    await assert.isNotNull(payload, "The payload shouldn't be null");
    await assert.isAtLeast(expirationTime, 0, "The expirationTime must be set to 0 or higher");

    try {
        return {
            "token": await jwtModel.signNewToken(payload, signatureType, expirationTime),
            "status": "success",
            "message": "Token created successfully."
        }
    } catch (err) {
        loggerService.logger.error(`error at clientApplication.newToken caused by ${err}`);
        return {
            "status": "error",
            "message": "There was an error creating the token, if the problem persist contact the system administrator."
        }
    }
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
        return {
            "payload": await jwtModel.verifyToken(token),
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
        let decodedToken = await jwtModel.decodeToken(token);

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

module.exports.newToken = newToken;
module.exports.verifyToken = verifyToken;
module.exports.revokeToken = revokeToken;
