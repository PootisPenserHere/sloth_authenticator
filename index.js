"use strict";

require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const asyncHandler = require('express-async-handler');
const cors = require('cors');

const genericErrorHandling = require('./src/middleware/genericErrorHandler');

const jwtTest = require('./src/model/jwt');
const fs = require('fs');

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

app.get('/',  asyncHandler(async (req, res, next) => {
    let payload = {
        "test": "cosa",
        "int": 111
    };

    let syncToken = await jwtTest.signNewSyncToken(process.env.JWT_MASTER_SECRET, payload, 600);

    let privateKey = await fs.readFileSync('./keys/id_rsa');
    let publicKey = await fs.readFileSync('./keys/id_rsa.pub');
    let asyncToken = await jwtTest.signNewAsyncToken({'key': privateKey, 'passphrase': 'top secret'}, payload, 600);

    let response = {
        "syncToken": syncToken,
        "decodedSync": await jwtTest.verifySyncToken(syncToken, process.env.JWT_MASTER_SECRET),
        "asyncToken": asyncToken,
        "decodedAsync": await jwtTest.verifySyncToken(asyncToken, publicKey),
    };

    res.send(response);
}));

/*
 * Catches any exception that wasn't properly handled by the other processes and returns the user
 * a generic respond while logging the error
 */
app.use(genericErrorHandling.handleUnCaughtError);

app.listen(process.env.APP_PORT, function () {
    console.log(`App listening on port ${process.env.APP_PORT}!`);
});

