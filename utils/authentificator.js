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

module.exports = {
    checkAuthenticated,
    checkNotAuthenticated
};