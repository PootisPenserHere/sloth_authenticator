"use strict";

const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.POSTGRES_DB, process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    //username: process.env.POSTGRES_USER,
    //password: process.env.POSTGRES_PASSWORD,
    //database: process.env.POSTGRES_DB,
    dialect: 'postgres',
    timezone: '-7',

    pool: {
        max: 20,
        min: 0,
        idle: 10000
    },
});

sequelize.query("SELECT 1 AS cosas").then(results => {
    console.log(results);
});

class User extends Sequelize.Model {}
User.init({
    name: {
        field: 'name',
        type: Sequelize.STRING,
        notNull: true,
        unique: true
    },
    username: {
        field: 'username',
        type: Sequelize.STRING,
        notNull: true,
        unique: true
    },
    password: {
        name: 'password',
        type: Sequelize.STRING,
        notNull: true,
        unique: true
    },
    status: {
        name: 'status',
        type: Sequelize.ENUM('active', 'inactive'),
    },
}, {
    sequelize,
    timestamps:false, // This are handled by the database
    modelName: 'user'
});

let algo = User.build({
    name: "yhii1is2",
    username: "cos1sa2",
    password: "al1gos2",
});

algo.save().then(() => {
    // my nice callback stuff
});

module.exports.sequelize = sequelize;
