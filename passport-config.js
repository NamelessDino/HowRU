const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt');

function initialize(passport, getUserByEmail, getUserByID){
    const authenticateUser = async (email, password, done) => {
        const user = getUserByEmail(email);
        if (user == null) return done(null, false, {message: 'No User with that E-Mail'});
        try{
            if (await bcrypt.compare(password, user.password)) return done(null, user);
            else done(null, false, {message: 'User or Password incorrect'});
        }
        catch(e){
            done(e);
        }

    }
    passport.use(new LocalStrategy({usernameField: 'email'},
    authenticateUser));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => done(null, getUserByID(id)));
}

module.exports = initialize;