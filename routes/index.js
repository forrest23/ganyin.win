var utils = require('../utils');
var mongoose = require('mongoose');
var request = require('request');
var WXBizDataCrypt = require('../WXBizDataCrypt')
//var log4js = require('log4js');

var Todo = mongoose.model('Todo');
var User = mongoose.model('User');
var Joke = mongoose.model('Joke');
var License = mongoose.model('License');
var XcxUser = mongoose.model('XcxUser');
var ExpressOrder = mongoose.model('ExpressOrder');
var SmsLog = mongoose.model('SmsLog');
var Account = mongoose.model('Account');
var FoodOrder = mongoose.model('FoodOrder');


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

exports.signExpressOrder = function (req, res, next) {
  var id = req.query.id;
  var signAt = req.query.signAt;
  ExpressOrder.update({ _id: id }, { $set: { sign: true, signAt: signAt } }, function (err) {
    res.status(200);
    res.send('{"success":true}');
  });
}

exports.getExpressOrder = function (req, res, next) {
  var receiver = req.query.receiver;
  var sign = req.query.sign;
  var pageSize = req.query.pageSize;
  var lastId = req.query.lastId;
  if (lastId) {
    ExpressOrder.
      find({ receiver: receiver, sign: sign, _id: { $lt: lastId } }).
      sort('-scanAt').
      limit(pageSize).
      exec(function (err, orders) {
        if (err) return next(err);

        res.json(orders);
      });
  }
  else {
    ExpressOrder.
      find({ receiver: receiver, sign: sign }).
      sort('-scanAt').
      limit(pageSize).
      exec(function (err, orders) {
        if (err) return next(err);

        res.json(orders);
      });
  }
};

exports.saveExpressOrder = function (req, res, next) {
  // log4js.loadAppender('file');
  // log4js.addAppender(log4js.appenders.file('log/cheese.log'), 'cheese');
  // var logger = log4js.getLogger('cheese');

  var shipperCode = req.query.shipperCode;
  var logisticCode = req.query.logisticCode;
  var shipperName = req.query.shipperName;
  var receiver = req.query.receiver;
  var receiverCode = req.query.receiverCode;
  var scaner = req.query.scaner;
  var scanerCode = req.query.scanerCode;
  var scanAt = req.query.scanAt;

  new ExpressOrder({
    shipperCode: shipperCode,
    logisticCode: logisticCode,
    shipperName: shipperName,
    receiver: receiver,
    receiverCode: receiverCode,
    scaner: scaner,
    scanerCode: scanerCode,
    scanAt: scanAt,
    remark: '',
    signAt: '',
    sign: false,
  }).save(function (err, expressOrder, count) {
    if (err) return next(err);

    Account.findOne({ name: receiver }, function (err, account) {
      if (account) {
        var mobile = account.phone;
        if (mobile && mobile.length == 11) {
          var tpl_value = '#name#=' + receiver + '&#shipperName#=' + shipperName + '&#shipNo#=' + logisticCode;
          tpl_value = encodeURIComponent(tpl_value);

          var url = 'https://v.juhe.cn/sms/send?mobile=' + mobile + '&tpl_id=27581&tpl_value=' + tpl_value + '&dtype=json&key=b170c3e0672820a9b707d0ea40451684';
          request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
              var info = JSON.parse(body);
              var error_code = info.error_code;
              var reason = info.reason;
              var sid = '';
              var count = '';
              var fee = '';
              if (info.error_code == 0) {
                sid = info.sid;
                count = info.count;
                fee = info.fee;
              }

              new SmsLog({
                shipperCode: shipperCode,
                shipperName: shipperName,
                logisticCode: logisticCode,
                error_code: error_code,
                reason: reason,
                sid: sid,
                count: count,
                fee: fee,
                create_at: Date.now(),
                phone: mobile
              }).save(function (err, todo, count) {
                if (err) return next(err);
              });

            }
          })
        }
      }
      else {

      }
    });

    res.status(200);
    res.send('{"success":true}');
  });
};

exports.saveFoodOrder = function (req, res, next) {
  var departName = '未知';
  var name = req.body.name;

  Account.findOne({ name: name }, function (err, account) {
    if (account) {
      departName = account.departName;
    }

    new FoodOrder({
      orderCode: req.body.orderCode,
      name: req.body.name,
      departName: departName,
      orderDate: req.body.orderDate,
      amount: req.body.amount,
      remark: req.body.remark,
    }).save(function (err, foodOrder, count) {
      if (err) return next(err);

      res.status(200);
      res.send('{"success":true}');
    });
  });
};

exports.getMyFoodOrder = function (req, res, next) {
  var orderCode = req.query.orderCode;
  var lastId = req.query.lastId;
  var pageSize = req.query.pageSize;
  if (lastId) {
    FoodOrder.
      find({ orderCode: orderCode, _id: { $lt: lastId } }).
      sort('-orderDate').
      limit(pageSize).
      exec(function (err, foodOrders) {
        if (err) return next(err);

        res.json(foodOrders);
      });
  }
  else {
    FoodOrder.
      find({ orderCode: orderCode}).
      sort('-orderDate').
      limit(pageSize).
      exec(function (err, foodOrders) {
        if (err) return next(err);

        res.json(foodOrders);
      });
  }
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

        XcxUser.findOne({ openId: data.openId }, function (err, user) {
          if (user) {
            res.send(user);
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

