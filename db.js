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

var License = new Schema({
    date: String,
    amount: Number,
    mini_price: Number,
    avg_price: Number,
    person: Number,
    deadline: String
});

var XcxUser = new Schema({
    userCode: String,
    userName: String,
    openId: String,
    nickName: String,
    gender: String,
    language: String,
    city: String,
    province: String,
    country: String,
    avatarUrl: String,
    appid: String,
    timestamp: String,
    create_at: Date,
    updated_at: Date
});

mongoose.model('Todo', Todo);
mongoose.model('User', User);
mongoose.model('Joke', Joke);
mongoose.model('License', License);
mongoose.model('XcxUser', XcxUser);
mongoose.connect('mongodb://localhost/express');

