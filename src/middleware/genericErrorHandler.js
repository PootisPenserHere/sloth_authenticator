"use strict";

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
    console.log(`got an uncaught error caused by: ${err.stack}`);

    res.status(500).send({
        "status": "error",
        "message": err.message
    });

    return;
}

module.exports.handleUnCaughtError = handleUnCaughtError;
