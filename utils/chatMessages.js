const ChatSchema = require('../models/ChatSchema');
const mongoose = require('mongoose');
const dbconnect = require('./dbconnect');

async function saveMessage(roomID, username, email, message) {
    let chatMessage = new ChatSchema({
        roomID: roomID,
        sender: {
            username: username,
            email: email
        },
        message: message
    });
    await chatMessage.save();
}
async function getMessagesFromRoom(roomID) {
    var chatArray = [];
    await ChatSchema.find({
        'roomID': roomID
    }).then((chats) => {
        chats.forEach((chat) => {
            chatArray.push({
                roomID: chat.roomID,
                sender: {
                    username: chat.sender.username,
                    email: chat.sender.email
                },
                message: chat.message
            });
        });
    });
    return chatArray;
}

async function getMessages() {
    var chatArray = [];
    await ChatSchema.find()
        .then((chats) => {
            chats.forEach((chat) => {
                chatArray.push({
                    roomID: chat.roomID,
                    sender: {
                        username: chat.sender.username,
                        email: chat.sender.email
                    },
                    message: chat.message
                });
            });
        });
        
    return chatArray;
}

module.exports = {
    saveMessage,
    getMessagesFromRoom,
    getMessages
}