//! Connection Setup
//! Requirements for all the Connections needed for the Web-App
const path = require('path')
const express = require('express');
const app = express(); //server and url handling
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const port = 3000 || process.env.PORT;
const connect = require('./utils/dbconnect');
const session = require('express-session');

//! Variables and Functions
const bodyParser = require('body-parser');
const passport = require('passport');
const flash = require('express-flash');
require('dotenv/config');
const MethodOverride = require('method-override');
const formatMessage = require('./utils/messages');
const Chat = require('./models/ChatSchema');
const {
    createUser,
    getCurrentUser,
    getUsers
} = require('./utils/users');

//Password encryption with bcrypt
const bcrypt = require('bcrypt');

// Authentication handling with passport
const initializePassport = require('./passport-config.js');
initializePassport(
    passport,
    email => getUsers().find(user => user.email === email),
    id => getUsers().find(user => user.id === id)
);
const broadcast = 'Broadcast';
var user = {};

//! Code

app.set('view-engine', 'ejs');
app.use(express.urlencoded({
    extended: false
}));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(MethodOverride('_method'));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/fa-css', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free/css')));
app.use('/fa-js', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free/js')));

//* Routes
// Handling URLs

app.get("/", checkAuthenticated, (req, res) => {
    user = req.user;
    res.render('index.ejs', {name: user.username})
});
app.get("/chat", checkAuthenticated, (req, res) => {
    res.render('chat.ejs', {name: user.username});
});
app.route("/login")
    .get(checkNotAuthenticated, (req, res) => {
        res.render('login.ejs')
    })
    .post(checkNotAuthenticated, passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }));
app.route("/register")
    .get(checkNotAuthenticated, (req, res) => {
        res.render('register.ejs');
    })
    .post(checkNotAuthenticated, async (req, res) => {
        try {
            // Hashing the password of the newly created user
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            createUser(
                Date.now().toString(),
                req.body.username,
                req.body.email,
                hashedPassword
            );
            res.redirect('/login');
        } catch {
            res.redirect('/register')
        }
        console.log(getUsers());
    });

    app.delete("/logout", (req, res) => {
        req.logOut();
        res.redirect("/login");
    });

//* Express App

app.use(bodyParser.json);

//* Socket.io
//Web Socket Handling: connectiong to socket, emitting messagesm etc.

//Function on connection to the Websocket
io.on('connection', function (socket) {
    console.log(socket.id);
    const username = user.username;
    const room = "Test";

    // Emitting a join Room Signal which notifies all users, which user joined the room
    socket.on("JoinRoom", () => {
        console.log('Room Joined');
        socket.broadcast.emit('broadcast', formatMessage(broadcast, `${username} has joined the Chat...`));
    });

    // Emitting a chat message to the front-end
    socket.on('chat message', function (msg) {
        io.emit('chat message', formatMessage(username, msg));
        connect.then(function (db) {
            console.log("connection to database while receiving message");
            console.log(`Raum: ${room}, Sender: ${username}, Message: ${msg}`)
            let chatMessage = new Chat({
                roomName: "Test",
                sender: username,
                message: msg
            });
            chatMessage.save();
        })
    });

    // Emitting a disconnect signal which notifies all users, which user left the room
    socket.on('disconnect', function () {
        socket.broadcast.emit('broadcast', formatMessage(broadcast, `${username} has left the Chat...`));
    });
});

//* Server
server.listen(port, function () {
    console.log(`Server running on http://localhost:${port}`);
});

//Checking whether a user is not logged in
//Preventing not logged in users to enter sites, they are not allowed to
function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()) return next();
    res.redirect("/login");
}

//Checking whether a user is already logged in.
//Preventing a already logged in user to enter the registration or login site
function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()) return res.redirect("/");
    next();
}
