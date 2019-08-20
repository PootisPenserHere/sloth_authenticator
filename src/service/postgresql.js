"use strict";

const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.POSTGRES_DB, process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    //username: process.env.POSTGRES_USER,
    //password: process.env.POSTGRES_PASSWORD,
    //database: process.env.POSTGRES_DB,
    dialect: 'postgres',

    pool: {
        max: 20,
        min: 0,
        idle: 10000
    },
});

sequelize.query("SELECT 1 AS cosas").then(results => {
    console.log(results);
});

module.exports.sequelize = sequelize;
