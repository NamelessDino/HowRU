const express = require('express');
const router = express.Router();
//Password encryption with bcrypt
const bcrypt = require('bcrypt');
const {
    createUser,
    getUserByEmail
} = require('../utils/users');
const {
    checkNotAuthenticated
} = require('../utils/authentificator');
router.route('/')
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
                        msg: 'Bei der Registrierung ist ein Fehler aufgetreten. Bitte versuch es erneut'
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

module.exports = router;