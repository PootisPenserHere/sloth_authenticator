"use strict";

const loggerService = require('../service/logger');

/**
 * Middleware to control uncaught errors through the application
 *
 * @module GenericErrorHandler
 */

/**
 * A generic error handler to control unhandled exceptions and send the client a response
 * in a json format with appropriate feedback while also logging the error
 *
 * NOTE in the case of async functions a middleware will be required so that the error to
 * this handler, express-async-handler is suggested
 *
 * @param err
 * @param req
 * @param res
 * @param next
 */
function handleUnCaughtError (err, req, res, next) {
    loggerService.logger.error(`got an uncaught error caused by: ${err.stack}`);

    res.status(500).send({
        "status": "error",
        "message": "An unexpected error occurred while processing the request, if the problem persists " +
            "contact the system administrator"
    });

    return;
}

/**
 * Reads the status sent as string in the json response and changes the http status
 * to 500 if the current code is 200
 *
 * @param body
 * @param req
 * @param res
 */
function handledErrorReturnCode500 (body, req, res) {
    if(res.statusCode === 200 && body.status === 'error') {
        res.status(500);
    }
}

module.exports.handleUnCaughtError = handleUnCaughtError;
module.exports.handledErrorReturnCode500 = handledErrorReturnCode500;
