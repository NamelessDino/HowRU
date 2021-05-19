const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const UserSchema = require('./models/UserSchema');
const {
    getUserByEmail,
} = require('./utils/users');

function initialize(passport) {
    const authenticateUser = (email, password, done) => {
        getUserByEmail(email)
            .then(async user => {
                if (!user) return done(null, false, {
                    message: 'No User with that E-Mail found'
                });
                try {
                    if (await bcrypt.compare(password, user.password)) return done(null, user);
                    else done(null, false, {
                        message: 'Password incorrect'
                    });
                } catch (err) {
                    console.log(err);
                    return done(err);
                }
            })
            .catch(err => {
                console.log(err);
                return done(err);
            });

    }
    passport.use(new LocalStrategy({
            usernameField: 'email'
        },
        authenticateUser));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        UserSchema.findById(id, (err, user) => {
            done(err, user);
        });
    });
}

module.exports = initialize;