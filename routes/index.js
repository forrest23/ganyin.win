var utils = require('../utils');
var mongoose = require('mongoose');
var request = require('request');
var WXBizDataCrypt = require('../WXBizDataCrypt')
var Todo = mongoose.model('Todo');
var User = mongoose.model('User');
var Joke = mongoose.model('Joke');
var License = mongoose.model('License');
var XcxUser = mongoose.model('XcxUser');

exports.index = function (req, res, next) {
  var user_id = req.cookies ?
    req.cookies.user_id : undefined;

  Todo.
    find({ user_id: user_id }).
    sort('-updated_at').
    exec(function (err, todos) {
      if (err) return next(err);

      res.render('index', {
        title: 'GanYin Todo',
        todos: todos
      });
    });
};

exports.create = function (req, res, next) {
  new Todo({
    user_id: req.cookies.user_id,
    content: req.body.content,
    updated_at: Date.now()
  }).save(function (err, todo, count) {
    if (err) return next(err);

    res.redirect('/');
  });
};

exports.destroy = function (req, res, next) {
  Todo.findById(req.params.id, function (err, todo) {
    var user_id = req.cookies ?
      req.cookies.user_id : undefined;

    if (todo.user_id !== user_id) {
      return utils.forbidden(res);
    }

    todo.remove(function (err, todo) {
      if (err) return next(err);

      res.redirect('/');
    });
  });
};

exports.edit = function (req, res, next) {
  var user_id = req.cookies ?
    req.cookies.user_id : undefined;

  Todo.
    find({ user_id: user_id }).
    sort('-updated_at').
    exec(function (err, todos) {
      if (err) return next(err);

      res.render('edit', {
        title: 'GanYin Todo',
        todos: todos,
        current: req.params.id
      });
    });
};

exports.update = function (req, res, next) {
  Todo.findById(req.params.id, function (err, todo) {
    var user_id = req.cookies ?
      req.cookies.user_id : undefined;

    if (todo.user_id !== user_id) {
      return utils.forbidden(res);
    }

    todo.content = req.body.content;
    todo.updated_at = Date.now();
    todo.save(function (err, todo, count) {
      if (err) return next(err);

      res.redirect('/');
    });
  });
};

// ** express turns the cookie key to lowercase **
exports.current_user = function (req, res, next) {
  var user_id = req.cookies ?
    req.cookies.user_id : undefined;

  if (!user_id) {
    res.cookie('user_id', utils.uid(32));
  }

  next();
};

exports.getTodos = function (req, res, next) {
  var user_id = req.cookies ?
    req.cookies.user_id : undefined;

  Todo.
    find({ user_id: user_id }).
    sort('-updated_at').
    exec(function (err, todos) {
      if (err) return next(err);

      res.json(todos);
    });
};

exports.getTodoById = function (req, res, next) {
  var user_id = req.cookies ?
    req.cookies.user_id : undefined;

  Todo.
    find({ _id: req.params.id }).
    sort('-updated_at').
    exec(function (err, todos) {
      if (err) return next(err);

      res.json(todos);
    });
};

exports.createUser = function (req, res, next) {
  new User({
    user_name: 'test',
    password: 'test',
  }).save(function (err, user, count) {
    if (err) return next(err);

    res.redirect('/');
  });
};

exports.joke = function (req, res, next) {
  Joke.
    find().
    sort('-create_at').
    exec(function (err, jokes) {
      if (err) return next(err);

      res.render('joke', {
        title: '笑话',
        jokes: jokes
      });
    });
};

exports.xcxlogin = function (req, res, next) {
  var code = req.query.code;
  var encryptedData = req.query.encryptedData;
  var iv = req.query.iv;
  var appId = 'wxff3b3f18b08829d7';
  var appSecret = 'd60bbe15f5acdd2a138e858e1ba16cdf';

  var url = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + appId + '&secret=' + appSecret + '&js_code=' + code + '&grant_type=authorization_code';

  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var info = JSON.parse(body);
      var sessionKey = info.session_key;
      try {
        var pc = new WXBizDataCrypt(appId, sessionKey);
        var data = pc.decryptData(encryptedData, iv);

        XcxUser.findById(data.openId, function (err, user) {
          if (user) {

          }
          else {
            new XcxUser({
              userCode: '',
              userName: '',
              openId: data.openId,
              nickName: data.nickName,
              gender: data.gender,
              language: data.language,
              city: data.city,
              province: data.province,
              country: data.country,
              avatarUrl: data.avatarUrl,
              appid: data.appid,
              timestamp: data.timestamp,
              create_at: Date.now(),
              updated_at: Date.now()
            }).save(function (err, todo, count) {
              if (err) return next(err);
              res.send(data);
            });
          }
        });

      } catch (error) {
        res.send(daerrorta);
      }
    }
  })

};

exports.charts = function (req, res, next) {
  License.
    find().
    sort('date').
    exec(function (err, licenses) {
      if (err) return next(err);

      var dates = [];
      var amounts = [];
      var persons = [];
      for (var i = 0; i < licenses.length; i++) {
        dates.push(licenses[i].date);
        amounts.push(licenses[i].amount);
        persons.push(licenses[i].person);
      }
      res.render('charts', {
        title: '上海牌照投放和投标趋势图',
        dates: dates,
        amounts: amounts,
        persons: persons
      });
    });
};

