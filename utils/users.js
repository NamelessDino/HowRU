const users = [];

function createUser(id, username, email, password) {
    const user = {
        id,
        username,
        email,
        password
    };
    users.push(user);

    return user;
}

function getCurrentUser(id) {
    return users.find(user => user.id === id);
}

function getUsers(){
    return users;
}

module.exports = {
    createUser,
    getCurrentUser,
    getUsers
}