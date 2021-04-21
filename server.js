//! Connection Setup
const path = require('path')
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const port = 4000 || process.env.PORT;
const connect = require('./utils/dbconnect');
const chatRouter = require('./routes/chatroute');

//! Variables
const bodyParser = require('body-parser')
require('dotenv/config');
const formatMessage = require('./utils/messages');
const Chat = require('./models/ChatSchema');
const {
    UserJoin,
    getCurrentUser
} = require('./utils/users');
const broadcast = 'Broadcast';

//! Code
//* Express App
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json);

//* Routes
app.use("/chats", chatRouter);

//* Socket.io
io.on('connection', function (socket) {
    console.log(socket.id);
    socket.on("JoinRoom", function ({
        username,
        room
    }) {
        const user = UserJoin(socket.id, username, room);
        socket.join(user.room);

        socket.broadcast.to(user.room).emit('broadcast', formatMessage(broadcast, `${user.username} has joined the Chat...`));
    });

    socket.on('chat message', function (msg) {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('chat message', formatMessage(user.username, msg));
        connect.then(function (db) {
            console.log("connection to database while receiving message");
            //let chatMessage = new Chat({roomName: user.room, sender: user.username});
            //chatMessage.save();
        })
    });

    socket.on('disconnect', function () {
        socket.broadcast.emit('broadcast', formatMessage(broadcast, "A User has left the Chat..."));
    });
});

//* Server
server.listen(port, function () {
    console.log(`Server running on http://localhost:${port}`);
})