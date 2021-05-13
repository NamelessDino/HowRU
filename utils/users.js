const UserSchema = require('../models/UserSchema');
const mongoose = require('mongoose');
const dbconnect = require('./dbconnect');

function createUser(username, email, password) {

    let user = new UserSchema({
        _id: new mongoose.Types.ObjectId(),
        username: username,
        email: email,
        password: password
    });
    schemaUser.save();
    console.log("User saved to Database");

    return user;
}

function getUserByID(_id) {
    return UserSchema.findById(_id);
}

function getUserByEmail(email) {
    return UserSchema.findOne({
        'email': email
    });
}

module.exports = {
    createUser,
    getUserByID,
    getUserByEmail
}