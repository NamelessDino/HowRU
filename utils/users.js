const UserSchema = require('../models/UserSchema');
const mongoose = require('mongoose');
const dbconnect = require('./dbconnect');
const {
    formatUser
} = require('../utils/formatter');

function createUser(username, email, password) {
    console.log("creating User");
    let user = new UserSchema({
        _id: new mongoose.Types.ObjectId(),
        username: username,
        email: email,
        password: password
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

async function getUsers() {
    var userArray = [];
    await UserSchema.find().then((users) => {
        users.forEach(function (user) {
            userArray.push(formatUser(user));
        });
    });
    await userArray.sort(function (x, y) {
        return (x.admin === y.admin) ? 0 : x.admin ? -1 : 1;
    });
    return userArray;
}

async function deleteUserbyID(id) {
    await getUserByID(id).then(async (user) => {
        if (user) {
            await UserSchema.deleteOne(user);
        }
    });
}

async function updateAdminRightsByID(id) {
    await getUserByID(id).then(async (user) => {
        if (user) {
            if (user.admin) {
                await UserSchema.replaceOne({
                    _id: id
                }, {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    password: user.password,
                    admin: false
                });
            } else {
                await UserSchema.replaceOne({
                    _id: id
                }, {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    password: user.password,
                    admin: true
                });
            }
        }
    });
}

module.exports = {
    createUser,
    getUserByID,
    getUserByEmail,
    deleteUserbyID,
    getUsers,
    updateAdminRightsByID
}