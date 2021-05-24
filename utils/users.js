const UserSchema = require('../models/UserSchema');
const mongoose = require('mongoose');
const dbconnect = require('./dbconnect');

function createUser(username, email, password) {
    console.log("creating User");
    let user = new UserSchema({
        _id: new mongoose.Types.ObjectId(),
        username: username,
        email: email,
        password: password,
        admin: false
    });
    user.save();
    console.log("User saved to Database");

    return user;
}

function getUserByID(id) {
    return UserSchema.findById(id);
}

function getUserByEmail(email) {
    return UserSchema.findOne({
            'email': email
        })
}

module.exports = {
    createUser,
    getUserByID,
    getUserByEmail
}