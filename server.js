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
const Chat = require('./models/ChatSchema');
const {
    createUser,
    getUserByEmail
} = require('./utils/users');
const {
    createRoom,
    getRoomByName,
    getRooms
} = require('./utils/rooms');

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
app.route("/chat")
    .get(checkAuthenticated, async (req, res) => {
        let rooms = await getRooms();
        res.render('./pages/chatList.ejs', {
            user: formatUser(req.user),
            rooms: rooms
        });
    })
    .post(checkAuthenticated, (req, res) => {
        createRoom(req.body.roomName);
        res.redirect("/chat")
    })
//Rendering Chat Room and checking if User is authenticated
//:roomName is a Parameter and can be used to create multiple Chat-Rooms
app.get("/chat/:roomName", checkAuthenticated, (req, res) => {
    res.render('./pages/chatRoom.ejs', {
        user: formatUser(req.user),
        room: req.params.roomName
    });
});
//Rendering Admin Page and checking if User is authenticated
app.get("/admin", checkAuthenticated, (req, res) => {
    //Checking whether a User has admin rights or nor
    if (req.user.admin) res.render('./pages/admin.ejs', {
        user: formatUser(req.user)
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
app.route("/register")
    .get(checkNotAuthenticated, (req, res) => {
        res.render('./pages/register.ejs');
    })
    .post(checkNotAuthenticated, (req, res) => {
        const {
            username,
            email,
            password,
            password2
        } = req.body;
        let errors = [];
        getUserByEmail(email).then(async (user) => {
            //Check if email has been registered
            if (user) {
                errors.push({
                    msg: 'Die E-Mail ist bereits registriert'
                });
            }
            //Check if all fields are filled in
            if (!username || !email || !password || !password2) {
                errors.push({
                    msg: 'Bitte füllen Sie alle Felder aus'
                });
            }
            //Check if passwords match
            if (password !== password2) {
                errors.push({
                    msg: 'Passwörter stimmen nicht überein'
                });
            }
            //Check if errors occurred
            //if true, cancel registration
            if (errors.length > 0) {
                res.render('./pages/register.ejs', {
                    errors,
                    username,
                    email
                });
            }
            //if false, proceed with registration
            else {
                try {
                    // Hashing the password of the newly created user
                    const hashedPassword = await bcrypt.hash(password, 10);
                    createUser(
                        username,
                        email,
                        hashedPassword
                    );
                    req.flash('success_msg', 'Erfolgreich Registriert. Du kannst dich nun mit deiner E-Mail anmelden')
                    res.redirect('/login');
                } catch {
                    errors.push({
                        msg: 'Bei der Registrierung ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut'
                    });
                    res.render('register.ejs', {
                        errors,
                        username,
                        email
                    });
                }
            }
        });
    });

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
    socket.on("JoinRoom", (username, room) => {
        socket.join(room);
        console.log(`${username} has joined ${room}`);
        Chat.find({
            'roomName': room
        }).then(doc => {
            Object.entries(doc).forEach((entry) => {
                const [key, value] = entry;
                io.to(socket.id).emit('load history', formatMessage(value.sender.username, value.sender.email, moment(value.date), value.message));
            });
            io.to(room).emit('broadcast', formatMessage(broadcastName, '', moment(), `${username} has joined the Chat...`));
        });
    });

    // Emitting a chat message to the front-end
    socket.on('chat message', function (data) {
        io.in(data.room).emit('chat message', formatMessage(data.name, data.email, moment(), data.message));
        connect.then(function (db) {
            console.log("connection to database while receiving message");
            console.log(`Raum: ${data.room}, Sender: ${data.name}, Message: ${data.message}`)
            let chatMessage = new Chat({
                roomName: data.room,
                sender: {
                    username: data.name,
                    email: data.email
                },
                message: data.message
            });
            chatMessage.save();
        });
    });
});

//* Server
server.listen(port, function () {
    console.log(`Server running on http://localhost:${port}`);
});

//Checking whether a user is not logged in
//Preventing not logged in users to enter sites, they are not allowed to
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
}

//Checking whether a user is already logged in.
//Preventing a already logged in user to enter the registration or login site
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return res.redirect("/");
    next();
}