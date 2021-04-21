const express = require("express");
const connectdb = require("../utils/dbconnect");
const Chats = require("../models/ChatSchema");

const router = express.Router();

router.route("/:roomname").get((req, res, next) => {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    connectdb.then(db => {
        Chats.find({}).then(chat => {
            res.json(chat);
        });
    });
});

module.exports = router;