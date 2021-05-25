const express = require('express');
const router = express.Router();
const {
    formatUser
} = require('../utils/formatter');
const {
    createRoom,
    getRoomByName,
    getRooms
} = require('../utils/rooms');
const {
    checkAuthenticated
} = require('../utils/authentificator');

router.route('/')
    .get(checkAuthenticated, async (req, res) => {
        let rooms = await getRooms();
        res.render('./pages/chatList.ejs', {
            user: formatUser(req.user),
            rooms: rooms
        });
    })
    .post(checkAuthenticated, (req, res) => {
        let errors = [];
        getRoomByName(req.body.roomName).then(async (room) => {
            let rooms = await getRooms();
            if (room) {
                errors.push({
                    msg: 'Raum existiert bereits'
                });
            }
            if (errors.length > 0) {
                res.render('./pages/chatList.ejs', {
                    errors,
                    user: formatUser(req.user),
                    rooms: rooms
                });
            } else {
                if (createRoom(req.body.roomName))
                    res.redirect("/chat");
            }
        });
    });

//Rendering Chat Room and checking if User is authenticated
//:roomName is a Parameter and can be used to create multiple Chat-Rooms
router.get("/:roomName", checkAuthenticated, (req, res) => {
    getRoomByName(req.params.roomName).then((room) => {
        if (room) {
            res.render('./pages/chatRoom.ejs', {
                user: formatUser(req.user),
                room: room.name
            });
        } else {
            res.redirect("/chat");
        }
    });
});

module.exports = router;