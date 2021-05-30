const express = require('express');
const router = express.Router();
const {
    formatUser
} = require('../utils/formatter');
const {
    getMessages,
    getAverageMessagesPerUser
} = require('../utils/chatMessages');
const {
    getUsers,
    updateAdminRightsByID
} = require('../utils/users');
const {
    getAllRooms,
    getAllRoomsWithChatcount
} = require('../utils/rooms');
const {
    checkAuthenticated
} = require('../utils/authentificator');

//Rendering Admin Page and checking if User is authenticated
router.route("/")
    .get(checkAuthenticated, async (req, res) => {
        roomcount = (await getAllRooms()).length;
        usercount = (await getUsers()).length;
        messagecount = (await getMessages()).length;
        roomWithChat = (await getAllRoomsWithChatcount());
        averageMessagesPerUser = (await getAverageMessagesPerUser(await usercount));
        //Checking whether a User has admin rights or nor
        if (req.user.admin) res.render('./pages/admin.ejs', {
            user: formatUser(req.user),
            roomcount,
            usercount,
            messagecount,
            roomWithChat,
            averageMessagesPerUser
        });
        else res.redirect('/');
    });

module.exports = router;