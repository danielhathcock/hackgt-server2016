var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    email: String,
    password: String,
    token: String
});

module.exports = mongoose.model('User', userSchema);
