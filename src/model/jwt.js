"use strict";

/**
 * Model to create and interact with json web tokens
 *
 * @module jwtModel
 */

const assert = require('chai').assert;

const jwrService = require('../service/jwt');
const fileService = require('../service/file');
const blacklistModel = require('./blacklist');

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

    let decodedToken = await jwrService.decodeToken(token);
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
        tokenPayload = await jwrService.verifyToken(token, process.env.JWT_SECONDARY_SECRET)
    } else{
        let cert = await fileService.readFile(process.env.JWT_SECONDARY_RSA_PUBLIC_KEY);
        tokenPayload = await jwrService.verifyToken(token, cert);
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

module.exports.decodeToken = decodeToken;
module.exports.verifyToken = verifyToken;
