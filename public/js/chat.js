var socket = io();
var messageContainer = document.getElementById('message-container');
var messages = document.getElementById('message-box');
var form = document.getElementById('form');
var input = document.getElementById('input');



//*Join Room
socket.emit("JoinRoom", username, roomName, roomID);
form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!input.value) return;
    socket.emit('chat message', {
        name: username,
        email: email,
        message: input.value,
        roomName: roomName,
        roomID: roomID
    });
    input.value = '';
});
socket.on('load history', (msg) => {
    var cssClass;
    //Checking if the user from the message is the same as own username
    if (msg.email == email) cssClass = "myMessage";
    else cssClass = "hisMessage";
    outputMessageToHTML(cssClass, `<p class="meta"><b>${msg.username}</b>: <span>${msg.time}</span><p/> <p class="bubble">${msg.message}</p>`, 'auto');
});

socket.on('chat message', function (msg) {
    console.log(msg);
    var cssClass;
    //Checking if the user from the message is the same as own username
    if (msg.email == email) cssClass = "myMessage";
    else cssClass = "hisMessage";
    outputMessageToHTML(cssClass, `<p class="meta"><b>${msg.username}</b>: <span>${msg.time}</span><p/> <p class="bubble">${msg.message}</p>`, 'smooth');
});

socket.on('broadcast', function (msg) {
    console.log(msg);
    outputMessageToHTML('broadcast', `<p class="meta">${msg.username}: <span>${msg.time}</span><p/> <p>${msg.message}</p>`, 'smooth');
});

function outputMessageToHTML(cssClass, htmlText, behavior) {
    var item = document.createElement('li');
    item.classList.add(cssClass);
    item.innerHTML = htmlText;
    messages.appendChild(item);
    messageContainer.scrollTo({
        left: 0,
        top: messageContainer.scrollHeight,
        behavior: behavior
    });
}