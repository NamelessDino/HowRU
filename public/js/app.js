var socket = io();
var messages = document.getElementById('message-box');
var form = document.getElementById('form');
var input = document.getElementById('input');

//Get Username and Room
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

console.log(`${username}, ${room}`);

//Join Room
socket.emit("JoinRoom", {username, room});

form.addEventListener('submit', function(event) {
    event.preventDefault();
    if (input.value) {
        socket.emit('chat message', input.value);
        input.value = '';
    }
});

socket.on('chat message', function(msg){
    var cssClass;
    console.log(msg);
    var item = document.createElement('li');
    if(msg.username == username){
        cssClass = "myMessage";
    }
    else{
        cssClass = "hisMessage";
    }
    item.classList.add(cssClass);
    item.innerHTML = `<p class="meta"><b>${msg.username}</b>: <span>${msg.time}</span><p/> <p class="bubble">${msg.text}</p>`;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});

socket.on('broadcast', function(msg){
    console.log(msg);
    var item = document.createElement('li');
    item.classList.add("broadcast");
    item.innerHTML = `<p class="meta">${msg.username}: <span>${msg.time}</span><p/> <p>${msg.text}</p>`;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});

