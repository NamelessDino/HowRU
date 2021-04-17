const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const port = 4000 || process.env.PORT;
const path = require('path')

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', function(socket){
    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    })
});

server.listen(port, function(){
    console.log(`Server running on http://localhost:${port}`);
})