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
const favicon = require('serve-favicon')

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
    getMessages,
    getAverageMessagesPerUser
} = require('./utils/chatMessages');
const {
    getUsers,
    updateAdminRightsByID,
    deleteUserbyID
} = require('./utils/users');
const {
    getAllRooms,
    getAllRoomsWithChatcount,
} = require('./utils/rooms');
const {
    checkAuthenticated,
    checkNotAuthenticated
} = require('./utils/authentificator');

//Password encryption with bcrypt
const bcrypt = require('bcryptjs');

// Authentication handling with passport
const initializePassport = require('./passport-config.js');
initializePassport(
    passport
);
const broadcastName = 'Broadcast';

//! Code
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(expressLayouts);
app.set('view engine', 'ejs');
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

app.get("/user", checkAuthenticated, async (req, res) => {
    userList = await getUsers();
    res.render('./pages/userList.ejs', {
        user: formatUser(req.user),
        userList
    });
});

app.route("/user/:id")
    .put(checkAuthenticated, async (req, res) => {
        await updateAdminRightsByID(req.params.id);
        res.redirect("/user");
    })
    .delete(checkAuthenticated, async (req, res) => {
        await deleteUserbyID(req.params.id);
        res.redirect("/user");
    })

app.use("/admin", require('./routes/adminRouter.js'));

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
    req.flash('success_msg', 'Du hast dich erfolgreich abgemeldet')
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
    socket.on("JoinRoom", async (username, roomName, roomID) => {
        socket.join(roomName);
        (await getMessagesFromRoom(roomID)).forEach((entry) => {
            io.to(socket.id).emit('load history', formatMessage(entry.sender.username, entry.sender.email, moment(entry.date), entry.message));
        });
        io.to(roomName).emit('broadcast', formatMessage(broadcastName, '', moment(), `${username} has joined the Chat...`));
    });

    // Emitting a chat message to the front-end
    socket.on('chat message', function (data) {
        io.in(data.roomName).emit('chat message', formatMessage(data.name, data.email, moment(), data.message));
        saveMessage(data.roomID, data.name, data.email, data.message);
    });
});

//* Server
server.listen(port, function () {
    console.log(`Server running on http://localhost:${port}`);
});