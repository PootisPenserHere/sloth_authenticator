"use strict";

require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const asyncHandler = require('express-async-handler');
const cors = require('cors');

const genericErrorHandling = require('./src/middleware/genericErrorHandler');
const requestIdGeneratorMiddleware = require('./src/middleware/requestIdGenerator');
const clientApplication = require('./src/application/client');
const loggerService = require('./src/service/logger');

const app = express();

/*
 * Enable cors
 */
app.use(cors());
app.options('*', cors());

/*
 * Parses the request body into a json
 */
app.use(bodyParser.json());

/*
 * Run the context for each request. Assign a unique identifier to each request
 */
app.use(requestIdGeneratorMiddleware.httpContext);
app.use(requestIdGeneratorMiddleware.assignIdToIncomingRequest);

/**
 * New sync token signing to be used by client applications
 *
 * @Endpoint
 * @param {object} [payload] Contains any data that will be added to the token's payload
 * @param {int} [expirationTime] Defines the expiration time of the token, if not sent the token won't have an expiration
 */
app.post('/api/sync/sign',  asyncHandler(async (req, res, next) => {
    loggerService.logger.info("Test");
    res.send( await clientApplication.signSyncToken(req.body.payload, req.body.expirationTime) );
}));

/**
 * Decodes a sync token used by a client application
 *
 * @Endpoint
 * @param {string} token The jwt to be validated
 */
app.post('/api/sync/decode',  asyncHandler(async (req, res, next) => {
    res.send( await clientApplication.decodeSyncToken(req.body.token) );
}));

/**
 * New async token signing to be used by client applications
 *
 * @Endpoint
 * @param {object} [payload] Contains any data that will be added to the token's payload
 * @param {int} [expirationTime] Defines the expiration time of the token, if not sent the token won't have an expiration
 */
app.post('/api/async/sign',  asyncHandler(async (req, res, next) => {
    res.send( await clientApplication.signAsyncToken(req.body.payload, req.body.expirationTime) );
}));

/**
 * Decodes an async token used by a client application
 *
 * @Endpoint
 * @param {string} token The jwt to be validated
 */
app.post('/api/async/decode',  asyncHandler(async (req, res, next) => {
    res.send( await clientApplication.decodeAsyncToken(req.body.token) );
}));

app.post('/api/revoke',  asyncHandler(async (req, res, next) => {
    res.send( await clientApplication.revokeToken(req.body.token) );
}));

/*
 * Catches any exception that wasn't properly handled by the other processes and returns the user
 * a generic response while logging the error
 */
app.use(genericErrorHandling.handleUnCaughtError);

app.listen(process.env.APP_PORT, function () {
    console.log(`App listening on port ${process.env.APP_PORT}!`);
});

