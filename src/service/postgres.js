"use strict";

/**
 * The connection to the postgres database, this service exposes the connection object
 * and implements a connection pool for the object to be used through the app
 *
 * @module postgresService
 */

const Sequelize = require('sequelize');

const connection = new Sequelize({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    dialect: 'postgres',
    //timezone: '-7',

    pool: {
        max: 20,
        min: 0,
        idle: 10000
    },
});

module.exports.connection = connection;
