const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
require('dotenv/config');

const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Password}@datacluster.gefcj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const dbDependencies = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

const connect = mongoose.connect(uri, dbDependencies).then(function(){
    console.log("connected to database")
}).catch(function(err){
    console.log("An error has occured, connecting database");
    throw err;
})

module.exports = connect;
