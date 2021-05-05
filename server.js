//! Connection Setup
const path = require('path')
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const port = 3000 || process.env.PORT;
const connect = require('./utils/dbconnect');
const session = require('express-session');

//! Variables
const bodyParser = require('body-parser');
const passport = require('passport');
const flash = require('express-flash');
require('dotenv/config');
const formatMessage = require('./utils/messages');
const Chat = require('./models/ChatSchema');
const {
    createUser,
    getCurrentUser,
    getUsers
} = require('./utils/users');
const bcrypt = require('bcrypt');
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

//* Routes
app.get("/", checkAuthenticated, (req, res) => {
    user = req.user;
    res.render('index.ejs')
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

//* Express App
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json);

//* Socket.io
io.on('connection', function (socket) {
    console.log(socket.id);
    const username = user.username;
    const room = "Test"
    socket.on("JoinRoom", () => {
        console.log('Room Joined');
        socket.broadcast.emit('broadcast', formatMessage(broadcast, `${username} has joined the Chat...`));
    });
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
