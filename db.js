var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Todo = new Schema({
    user_id: String,
    content: String,
    updated_at: Date,
    status: Boolean,
});

var User = new Schema({
    user_name: String,
    password: String,
});

var Joke = new Schema({
    joke_id: String,
    author: String,
    author_img: String,
    create_at: Date,
    content: String,
    vote: String,
    comments: String
});

mongoose.model('Todo', Todo);
mongoose.model('User', User);
mongoose.model('Joke', Joke);
mongoose.connect('mongodb://localhost/express');
