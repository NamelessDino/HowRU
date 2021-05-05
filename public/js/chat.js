var socket = io();
var messages = document.getElementById('message-box');
var form = document.getElementById('form');
var input = document.getElementById('input');
var username = document.getElementsByTagName('head')[0].id;

//*Join Room
console.log(username);
socket.emit("JoinRoom");
form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!input.value) return;
    socket.emit('chat message', input.value);
    input.value = '';
});

socket.on('chat message', function (msg) {
    console.log(msg);
    var cssClass;
    if (msg.username == username) cssClass = "myMessage";
    else cssClass = "hisMessage";
    outputMessageToHTML(cssClass, `<p class="meta"><b>${msg.username}</b>: <span>${msg.time}</span><p/> <p class="bubble">${msg.text}</p>`);
});

socket.on('broadcast', function (msg) {
    console.log(msg);
    outputMessageToHTML('broadcast', `<p class="meta">${msg.username}: <span>${msg.time}</span><p/> <p>${msg.text}</p>`);
});

function outputMessageToHTML(cssClass, htmlText) {
    var item = document.createElement('li');
    item.classList.add(cssClass);
    item.innerHTML = htmlText;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
}