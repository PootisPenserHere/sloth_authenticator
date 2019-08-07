"use strict";

const uuid = require('uuid');
const httpContext = require('express-http-context');

/**
 * Gives each request a uuid to be tracked through its life cycle and provide more
 * manageable logging
 *
 * @param req
 * @param res
 * @param next
 */
function assignIdToIncomingRequest (req, res, next) {
    httpContext.ns.bindEmitter(req);
    httpContext.ns.bindEmitter(res);
    let requestId = req.headers["x-request-id"] || uuid.v4();
    httpContext.set("requestId", requestId);
    console.log('request Id set is: ', httpContext.get('requestId'));
    next();
}

module.exports.httpContext = httpContext.middleware;
module.exports.assignIdToIncomingRequest = assignIdToIncomingRequest;
