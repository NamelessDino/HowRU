var socket = io();

var messages = document.getElementById('message-box');
var form = document.getElementById('form');
var input = document.getElementById('input');

form.addEventListener('submit', function(event) {
    event.preventDefault();
    if (input.value) {
        socket.emit('chat message', input.value);
        input.value = '';
    }
});

socket.on('chat message', function(msg){
    console.log(msg);
    var item = document.createElement('li');
    item.classList.add("messages");
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});

socket.on('broadcast', function(msg){
    console.log(msg);
    var item = document.createElement('li');
    item.classList.add("broadcast");
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});


