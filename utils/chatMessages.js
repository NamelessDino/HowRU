const ChatSchema = require('../models/ChatSchema');
const mongoose = require('mongoose');
const dbconnect = require('./dbconnect');

async function saveMessage(roomName, username, email, message) {
    let chatMessage = new ChatSchema({
        roomName: roomName,
        sender: {
            username: username,
            email: email
        },
        message: message
    });
    await chatMessage.save();
}
async function getMessagesFromRoom(roomName) {
    var chatArray = [];
    await ChatSchema.find({
        roomName: roomName
    }).then((chats) => {
        chats.forEach((chat) => {
            chatArray.push({
                roomName: chat.roomName,
                sender: {
                    username: chat.sender.username,
                    email: chat.sender.email
                },
                message: chat.message
            });
        });
    });
    console.log(chatArray);
    return chatArray;
}

async function getMessages() {
    var chatArray = [];
    await ChatSchema.find()
        .then((chats) => {
            chats.forEach((chat) => {
                chatArray.push({
                    roomName: chat.roomName,
                    sender: {
                        username: chat.sender.username,
                        email: chat.sender.email
                    },
                    message: chat.message
                });
            });
        });
    console.log(chatArray);
    return chatArray;
}

module.exports = {
    saveMessage,
    getMessagesFromRoom,
    getMessages
}