"use strict";

const url = require('url');
const loggerService = require('../service/logger');

/**
 * Saves the route that was called as well as the verb of the request to the log file
 *
 * @param req
 * @param res
 * @param next
 */
function logEntryRoute (req, res, next) {
    loggerService.logger.info(`accessing the route ${url.parse(req.url).pathname} with the verb ${req.method}`);
    next();
}

module.exports.logEntryRoute = logEntryRoute;
