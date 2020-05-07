"use strict";

/**
 * Service containing the underlying logic to do basic operations with jwt
 *
 * @module jwtService
 */

const jwt = require('jsonwebtoken');
const crytoService = require('./crypto');
const loggerService = require('./logger');

/**
 * Creates a new jwt signed either a sync or async algorithm which will be determined based on the
 * passed secret
 *
 * @function
 * @name signNewToken
 * @param {string|object} secret The secret used to sign the token, a string for sync tokens or a cert in object format for async tokens
 * @param {object} [payload] Data to be carried over by the jwt defaults to {}
 * @param {int} [expirationTimeInSeconds] Defines who long the token will be valid for
 * if set to 0 the token won't expire defaults to 0
 * @returns {Promise<string>} A new jwt
 */
async function signNewToken(secret, payload = {}, expirationTimeInSeconds = 0) {
    let options = {
        /*
         * The secret is validated against its type, a string will be treated as a passphrase and used for sync signing
         * while an object will be handled as a buffer containing a private cert and will be used to sign an async token
         */
        'algorithm': typeof secret === 'string' ? process.env.JWT_SYNC_ALGORITH : process.env.JWT_ASYNC_ALGORITH,
        'jwtid': await crytoService.secureRandomString(16),
        'issuer': process.env.JWT_ISSUER
    };

    if(expirationTimeInSeconds && Number.isInteger(expirationTimeInSeconds)) {
        options.expiresIn =  expirationTimeInSeconds;
    }

    return await jwt.sign(payload, secret, options);
}

/**
 * Takes a secret in the form of a buffer for async tokens or a string for sync tokens and
 * attempts to verify the signature of the given token
 *
 * @function
 * @name verifyAsyncToken
 * @param {string} token A jwt to be verified
 * @param {string|buffer} secret To be used to verify the signature, a RSA cert for async tokens or a passphrase for sync tokens
 * @returns {Promise<{iat: int, exp: int, iss: string, jti: string}>}
 */
async function verifyToken(token, secret) {
    try {
        return await jwt.verify(token, secret);
    } catch(err) {
        loggerService.logger.error(err);
        throw Error("The token is invalid");
    }
}

/**
 * Decodes a token without verifying its signature
 *
 * @function
 * @name decodeToken
 * @param {string} token A jwt to be decoded
 * @returns {Promise<{header: {alg: string, typ:string}, payload: {iat: int, exp: int, iss: string, jti: string}, signature: signature}>} Contains the payload, headers and signature of the decoded token
 */
async function decodeToken(token) {
    try {
        return await jwt.decode(token, {complete: true});
    } catch(err) {
        loggerService.logger.error(err);
        throw Error("The token is invalid");
    }
}

module.exports.signNewToken = signNewToken;
module.exports.verifyToken = verifyToken;
module.exports.decodeToken = decodeToken;
