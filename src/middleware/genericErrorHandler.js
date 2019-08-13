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

module.exports.handleUnCaughtError = handleUnCaughtError;
