"use strict";

/**
 * Model to create and interact with json web tokens
 *
 * @module jwtModel
 */

const assert = require('chai').assert;

const jwtService = require('../service/jwt');
const fileService = require('../service/file');
const blacklistModel = require('./blacklist');

/**
 * New sync token signing to be used by client applications
 *
 * @function
 * @name signNewToken
 * @param {object} [payload] Contains any data that will be added to the token's payload
 * @param {string} signatureType Either async or sync to define the type of algorithm used to sign the token
 * @param {int} [expirationTime] Defines the expiration time of the token, if not sent the token won't have an expiration
 * @returns {Promise<{token: string, status: string, message, string}|{status: string, message, string}>}
 */
async function signNewToken(payload = {}, signatureType,  expirationTime = 0) {
    await assert.isNotNull(payload, "The payload shouldn't be null");
    await assert.isAtLeast(expirationTime, 0, "The expirationTime must be set to 0 or higher");

    let token;

    switch (signatureType) {
        case "async":
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
                // Loads the cert as a buffer
                cert = await fileService.readFile(process.env.JWT_SECONDARY_RSA_PRIVATE_KEY)
            }

            token = await jwtService.signNewToken(cert, payload, expirationTime);
            break;

        case "sync":
            token = await jwtService.signNewToken(process.env.JWT_SECONDARY_SECRET, payload, expirationTime);
            break;
        default:
            throw Error("Unknown algorithm, only async and sync are supported.");
    }

    return token;
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

    let decodedToken = await jwtService.decodeToken(token);
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
        tokenPayload = await jwtService.verifyToken(token, process.env.JWT_SECONDARY_SECRET)
    } else{
        let cert = await fileService.readFile(process.env.JWT_SECONDARY_RSA_PUBLIC_KEY);
        tokenPayload = await jwtService.verifyToken(token, cert);
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
    let decodedToken = await decodeToken(token);

    if(!decodedToken || await blacklistModel.lookUpByJti(decodedToken.jti)) {
        throw Error("The token is invalid");
    }

    return decodedToken;
}

module.exports.signNewToken = signNewToken;
module.exports.decodeToken = decodeToken;
module.exports.verifyToken = verifyToken;
