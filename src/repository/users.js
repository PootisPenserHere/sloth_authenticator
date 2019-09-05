"use strict";

const Sequelize = require('sequelize');
const postgresService = require('../service/postgres');

/* istanbul ignore next */
class User extends Sequelize.Model {}

module.exports = User.init({
    name: {
        field: 'name',
        type: Sequelize.STRING,
        notNull: true
    },
    username: {
        field: 'username',
        type: Sequelize.STRING,
        notNull: true,
        unique: true
    },
    password: {
        field: 'password',
        type: Sequelize.STRING,
        notNull: true
    },
    accessType: {
        field: 'access_type',
        type: Sequelize.ENUM('master', 'service', 'client'),
    },
    status: {
        field: 'status',
        type: Sequelize.ENUM('active', 'inactive'),
    },
}, {
    sequelize: postgresService.connection,
    timestamps:false, // This are handled by the database
    modelName: 'user'
});
