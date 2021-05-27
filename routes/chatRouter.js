const express = require('express');
const router = express.Router();
const {
    formatUser
} = require('../utils/formatter');
const {
    createRoom,
    getRoomByName,
    getAllRooms,
    getActiveRooms,
    setRoomInactive,
    getInactiveRooms,
    deleteRoomByID,
} = require('../utils/rooms');
const {
    checkAuthenticated
} = require('../utils/authentificator');

router.route('/')
    .get(checkAuthenticated, async (req, res) => {
        let rooms = await getActiveRooms();
        res.render('./pages/chatList.ejs', {
            user: formatUser(req.user),
            rooms: rooms
        });
    })
    .post(checkAuthenticated, (req, res) => {
        let errors = [];
        getRoomByName(req.body.roomName).then(async (room) => {
            if (room) {
                req.flash('error_msg', 'Raum existiert bereits')
                res.redirect('/chat');
            } else {
                await createRoom(req.body.roomName, req.user)
                res.redirect("/chat");
            }
        });
    })

//Rendering Chat Room and checking if User is authenticated
//:roomName is a Parameter and can be used to create multiple Chat-Rooms
router.route("/:roomName")
    .get(checkAuthenticated, (req, res) => {
        getRoomByName(req.params.roomName).then((room) => {
            if (room) {
                res.render('./pages/chatRoom.ejs', {
                    user: formatUser(req.user),
                    room: {
                        name: room.name,
                        id: room._id
                    }
                });
            } else {
                res.redirect("/chat");
            }
        });
    })
    .delete(checkAuthenticated, async (req, res) => {
        getRoomByName(req.params.roomName).then(async (room) => {
            await deleteRoomByID(room._id);
            res.redirect('/chat');
        })
    })

module.exports = router;