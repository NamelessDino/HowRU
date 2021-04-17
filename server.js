const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const port = 4000;
const path = __dirname + '/public';

app.use(express.static(path));

app.get('/', function(req, res){
    res.sendFile(path + '/view/index.html');
});

io.on('connection', function(socket){
    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    })
});

server.listen(port, function(){
    console.log("listening to *:" + port);
})