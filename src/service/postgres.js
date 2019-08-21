"use strict";

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

connection.query("SELECT 1 AS cosas").then(results => {
    console.log(results);
});

module.exports.connection = connection;
