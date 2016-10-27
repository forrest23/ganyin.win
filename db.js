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

mongoose.model('Todo', Todo);
mongoose.model('User', User);
mongoose.connect('mongodb://localhost/express-todo');
