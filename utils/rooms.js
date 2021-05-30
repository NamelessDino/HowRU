const RoomSchema = require('../models/RoomSchema');
const ChatSchema = require('../models/ChatSchema');
const {getMessagesFromRoom} = require('./chatMessages')
const mongoose = require('mongoose');
const dbconnect = require('./dbconnect');

async function createRoom(name, user) {
    let room = new RoomSchema({
        _id: new mongoose.Types.ObjectId(),
        name: name,
        owner: {
            username: user.username,
            email: user.email
        }
    });
    await room.save();
}

function getRoomByName(name) {
    return RoomSchema.findOne({
        'name': name
    });
}

async function getAllRooms() {
    var roomArray = [];
    await RoomSchema.find().then((rooms) => {
        rooms.forEach(function (room) {
            roomArray.push({
                name: room.name,
                id: room._id,
                owner: room.owner
            });
        });
    });
    return roomArray;
}
async function getAllRoomsWithChatcount() {
    let roomArrayWithChat = [];
    let roomArray = await getAllRooms();
    await asyncForEach(roomArray, async (room) => {
        let chatArray = await getMessagesFromRoom(room.id);
        roomArrayWithChat.push({
            name: room.name,
            messagecount: chatArray.length
        });
    });
    roomArrayWithChat.sort(function(a, b){return b.messagecount - a.messagecount});
    return await roomArrayWithChat;
}

async function deleteRoomByID(roomID) {
    await ChatSchema.deleteMany({
        'roomID': roomID
    }).then(async () => {
        await RoomSchema.deleteOne({
            '_id': roomID
        })
    }).finally(() => {return true});
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

module.exports = {
    createRoom,
    getRoomByName,
    getAllRooms,
    getAllRoomsWithChatcount,
    deleteRoomByID
}