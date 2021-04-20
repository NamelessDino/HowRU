const path = require('path')
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);

const port = 4000 || process.env.PORT;
const formatMessage = require('./utils/messages');
const {UserJoin, getCurrentUser} = require('./utils/users');
const { Socket } = require('dgram');

const broadcast = 'Broadcast'

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', function(socket){

    socket.on("JoinRoom", function({username, room}){
        const user = UserJoin(socket.id, username, room);
        socket.join(user.room);

        socket.broadcast.to(user.room).emit('broadcast', formatMessage(broadcast, `${user.username} has joined the Chat...`));
    });

    socket.on('chat message', function(msg){
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('chat message', formatMessage(user.username, msg));
    });

    socket.on('disconnect', function(){
        socket.broadcast.emit('broadcast', formatMessage(broadcast, "A User has left the Chat..."));
    });
});

server.listen(port, function(){
    console.log(`Server running on http://localhost:${port}`);
})