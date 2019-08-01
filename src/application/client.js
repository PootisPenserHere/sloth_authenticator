"use strict";

/**
 * Contains the business based logic to handle the third party clients authentication needs
 *
 * @module clientApplication
 */

const jwt = require('../model/jwt');
const fileService = require('../service/file');
const dateService = require('../service/date');
const redisService = require('../service/redis');

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
    try {
        return {
            "token": await jwt.signNewSyncToken(process.env.JWT_SECONDARY_SECRET, payload, expirationTime),
            "status": "success",
            "message": "Token created successfully."
        }
    } catch (err) {
        console.log(`error at clientApplication.signSyncToken caused by ${err}`);
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
    try {
        return {
            "payload": await jwt.verifySyncToken(token, process.env.JWT_SECONDARY_SECRET),
            "status": "success",
            "message": "The token is valid."
        }
    } catch (err) {
        console.log(`error at clientApplication.decodeSyncToken caused by ${err}`);
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
        console.log(`error at clientApplication.signAsyncToken caused by ${err}`);
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
    try {
        let cert = await fileService.readFile(process.env.JWT_SECONDARY_RSA_PUBLIC_KEY);

        return {
            "payload": await jwt.verifyAsyncToken(token, cert),
            "status": "success",
            "message": "The token is valid."
        }
    } catch (err) {
        console.log(`error at clientApplication.decodeAsyncToken caused by ${err}`);
        return {
            "status": "error",
            "message": "The token is invalid."
        }
    }
}

async function revokeToken(token) {
    try {
        let decodedToken = await jwt.decodeToken(token);

        /*
         * The tokens are verified based on their signature type this is done to determine
         * if the token sent is still valid to the system and avoid precessing the ones
         * that have already expired or have the wrong signature
         *
         * The input is ignored as the needed data already exists in the decodedToken variable
         */
        if(decodedToken.header.alg.indexOf("HS") > -1) {
            // For sync tokens
            await jwt.verifySyncToken(token, process.env.JWT_SECONDARY_SECRET)
        } else{
            // Async tokens
            let cert = await fileService.readFile(process.env.JWT_SECONDARY_RSA_PUBLIC_KEY);
            await jwt.verifyAsyncToken(token, cert);
        }

        let timeLeftInSeconds = await dateService.secondsLeftTillTimestamp(decodedToken.payload.exp);

        return {
            "payload": await jwt.decodeToken(token),
            "status": "success",
            "message": "The token is valid."
        }
    } catch (err) {
        console.log(`error at clientApplication.decodeSyncToken caused by ${err}`);
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
