"use strict";

const Sequelize = require('sequelize');

const postgresqlService = require('../service/postgresql');

class User extends Sequelize.Model {}

module.exports = User.init({
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
    sequelize: postgresqlService.connection,
    timestamps:false, // This are handled by the database
    modelName: 'user'
});
