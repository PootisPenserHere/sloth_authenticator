"use strict";

/**
 * Model that exposes the underlying logic to sign and verify tokens
 *
 * @module jwt
 */

const jwt = require('jsonwebtoken');
const crytoService = require('../service/crypto');

/**
 * Creates a new jwt signed with a sync hashing algorithm
 *
 * @function
 * @name signNewSyncToken
 * @param {string} secret The secret used to sign the token
 * @param {object} [payload] Data to be carried over by the jwt defaults to {}
 * @param {int} [expirationTimeInSeconds] Defines who long the token will be valid for
 * if set to 0 the token won't expire defaults to 0
 * @returns {Promise<string>} A new jwt
 */
async function signNewSyncToken(secret, payload = {}, expirationTimeInSeconds = 0) {
    let options = {
        'algorithm': process.env.JWT_SYNC_ALGORITH,
        'jwtid': await crytoService.secureRandomString(16),
        'issuer': process.env.JWT_ISSUER
    };

    if(expirationTimeInSeconds && Number.isInteger(expirationTimeInSeconds)) {
        options.expiresIn =  expirationTimeInSeconds;
    }

    // TODO wrap in a try catch block
    return await jwt.sign(payload, secret, options);
}

/**
 * Uses the given secret to verify that the jwt is valid
 *
 * @function
 * @name verifySyncToken
 * @param {string} token A jwt to be verified
 * @param {string} secret The secret used to sign the token
 * @returns {Promise<{iat: int, exp: int, iss: string, jti: string}>}
 */
async function verifySyncToken(token, secret) {
    try {
        return await jwt.verify(token, secret);
    } catch(err) {
        // TODO log the error with more details
        throw Error("The token is invalid, please login again.");
    }
}

/**
 * Creates a new jwt signed with an async hashing algorithm
 *
 * @function
 * @name signNewAsyncToken
 * @param {string|Buffer} cert A RSA to be used to sign the key
 * @param {object} [payload] Data to be carried over by the jwt defaults to {}
 * @param {int} [expirationTimeInSeconds] Defines who long the token will be valid for
 * if set to 0 the token won't expire defaults to 0
 * @returns {Promise<string>} A new jwt
 */
async function signNewAsyncToken(cert, payload = {}, expirationTimeInSeconds = 0) {
    let options = {
        'algorithm': process.env.JWT_ASYNC_ALGORITH,
        'jwtid': await crytoService.secureRandomString(16),
        'issuer': process.env.JWT_ISSUER
    };

    if(expirationTimeInSeconds && Number.isInteger(expirationTimeInSeconds)) {
        options.expiresIn =  expirationTimeInSeconds;
    }

    // TODO wrap in a try catch block
    return await jwt.sign(payload, cert, options);
}

/**
 * Uses the given cert to verify that the jwt is valid
 *
 * @function
 * @name verifyAsyncToken
 * @param {string} token A jwt to be verified
 * @param {string|Buffer} cert A RSA to be used to sign the key
 * @returns {Promise<{iat: int, exp: int, iss: string, jti: string}>}
 */
async function verifyAsyncToken(token, cert) {
    try {
        return await jwt.verify(token, cert);
    } catch(err) {
        // TODO log the error with more details
        throw Error("The token is invalid, please login again.");
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
        // TODO log the error with more details
        throw Error("The token is invalid, please login again.");
    }
}

module.exports.signNewSyncToken = signNewSyncToken;
module.exports.verifySyncToken = verifySyncToken;
module.exports.signNewAsyncToken = signNewAsyncToken;
module.exports.verifyAsyncToken = verifyAsyncToken;
module.exports.decodeToken = decodeToken;
