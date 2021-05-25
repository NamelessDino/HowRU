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
const favicon = require('serve-favicon');

//! Variables and Functions
const expressLayouts = require('express-ejs-layouts');
const moment = require('moment')
const bodyParser = require('body-parser');
const passport = require('passport');
const flash = require('express-flash');
require('dotenv/config');
const MethodOverride = require('method-override');
const {
    formatMessage,
    formatUser
} = require('./utils/formatter');
const {
    saveMessage,
    getMessagesFromRoom,
    getMessages
} = require('./utils/chatMessages');
const {
    createUser,
    getUserByEmail,
    getUsers
} = require('./utils/users');
const {
    createRoom,
    getRoomByName,
    getRooms
} = require('./utils/rooms');
const {
    checkAuthenticated,
    checkNotAuthenticated
} = require('./utils/authentificator');

//Password encryption with bcrypt
const bcrypt = require('bcrypt');

// Authentication handling with passport
const initializePassport = require('./passport-config.js');
initializePassport(
    passport
);
const broadcastName = 'Broadcast';

//! Code
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.use(favicon(path.join(__dirname, 'favicon.ico')));
app.use(express.urlencoded({
    extended: false
}));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
})
app.use(passport.initialize());
app.use(passport.session());
app.use(MethodOverride('_method'));

//* Routes
// Handling URLs

//Rendering Index Page
app.get("/", checkAuthenticated, (req, res) => {
    res.render('./pages/index.ejs', {
        user: formatUser(req.user)
    });
});
//Rendering Chat Page and checking if User is authenticated
app.use("/chat", require('./routes/chatRouter.js'));

//Rendering Admin Page and checking if User is authenticated
app.get("/admin", checkAuthenticated, async (req, res) => {
    roomcount = (await getRooms()).length;
    usercount = (await getUsers()).length;
    messagecount = (await getMessages()).length
    //Checking whether a User has admin rights or nor
    if (req.user.admin) res.render('./pages/admin.ejs', {
        user: formatUser(req.user),
        roomcount,
        usercount,
        messagecount
    });
    else res.redirect('/');
});
app.route("/login")
    .get(checkNotAuthenticated, (req, res) => {
        res.render('./pages/login.ejs')
    })
    .post(checkNotAuthenticated, passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }));

app.use("/register", require('./routes/registerRouter.js'));

app.delete("/logout", (req, res) => {
    req.logOut();
    req.flash('success_msg', 'Du hast die erfolgreich abgemeldet')
    res.redirect("/login");
});
//* Express App

app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use(bodyParser.json);

//* Socket.io
//Web Socket Handling: connectiong to socket, emitting messagesm etc.

//Function on connection to the Websocket
io.on('connection', function (socket) {
    // Emitting a join Room Signal which notifies all users, which user joined the room
    socket.on("JoinRoom", async (username, room) => {
        socket.join(room);
        console.log(`${username} has joined ${room}`);
        (await getMessagesFromRoom(room)).forEach((entry) => {
            io.to(socket.id).emit('load history', formatMessage(entry.sender.username, entry.sender.email, moment(entry.date), entry.message));
        });
        io.to(room).emit('broadcast', formatMessage(broadcastName, '', moment(), `${username} has joined the Chat...`));
    });

    // Emitting a chat message to the front-end
    socket.on('chat message', function (data) {
        io.in(data.room).emit('chat message', formatMessage(data.name, data.email, moment(), data.message));
        connect.then(function (db) {
            console.log("connection to database while receiving message");
            console.log(`Raum: ${data.room}, Sender: ${data.name}, Message: ${data.message}`)
            saveMessage(data.room, data.name, data.email, data.message);
        });
    });
});

//* Server
server.listen(port, function () {
    console.log(`Server running on http://localhost:${port}`);
});