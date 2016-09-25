var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sellerSchema = new Schema({
    email: String,
    idOfPost: Number,
    eventDate: String,
    author: String,
    price: Number
});

module.exports = mongoose.model('Seller', sellerSchema);
