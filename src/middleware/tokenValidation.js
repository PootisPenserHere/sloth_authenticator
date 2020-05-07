"use strict";

const jwt = require('express-jwt');
const scopeChecker = require('express-jwt-permissions')();
const loggerService = require('../service/logger');

/**
 * Middleware to validate and control the access right to the routes of this api
 *
 * @module TokenValidation
 */


/**
 * Validates the received jwt against the standard requirements
 */
const tokenValidator = jwt({
    credentialsRequired: true,
    // TODO validate async token
    // TODO adjust for master and secondary secrets
    secret: process.env.JWT_SECONDARY_SECRET,
    requestProperty: 'user',
    getToken: function fromHeaderOrQuerystring (req) {
        loggerService.logger.debug(JSON.stringify(req.headers));
        loggerService.logger.debug(JSON.stringify(req.query));
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            return req.headers.authorization.split(' ')[1];
        } else if (req.query && req.query.token) {
            return req.query.token;
        }
        return null;
    }
})
    .unless({
        path: [
            '/health-check'
        ]
    });

/**
 * Should there be an error returns a message and interrupts the execution of further code
 *
 * @param {object} err
 * @param {object} req
 * @param {object} res
 * @param  next
 */
function handledValidationError (err, req, res, next) {
    if(err.name === 'unauthorizedError') {
        loggerService.logger.warn(`Failed attempt to authenticate with an invalid token ${err}`);
        res.status(err.status).send({message:err.message});
        return;
    }
    next();
}

/**
 * In case of an attempt to access a protected route an error will be raised
 *
 * @param {object} err
 * @param {object} req
 * @param {object} res
 * @param next
 */
function handledNoPermissionsError (err, req, res, next) {
    // If the user has a token that is readable but invalid
    if (err.code === 'permission_denied') {
        res.status(403).send({
            "status": "error",
            "message": "Forbidden"
        });

        return;
    }

    // If no token was sent or it could not be decoded
    else if (err.code === 'user_object_not_found') {
        let errorMessage = "unauthorized access to the route " + req.route.path + " with the verb " +
            req.route.stack[0].method + " by a user with a corrupted token";
        loggerService.logger.warn(errorMessage);

        res.status(403).send({
            "status": "error",
            "message": "Forbidden",
            "hint": "The token could not be decoded, verify that it's valid or was sent in the proper header"
        });
        return;
    }
    next();
}

module.exports.tokenValidator = tokenValidator;
module.exports.handledValidationError = handledValidationError;
module.exports.scopeChecker = scopeChecker;
module.exports.handledNoPermissionsError = handledNoPermissionsError;
