
var User = require('../../models').User;
var Account = require('../../models').Account;
// var Notification = require('../../models').Notification;
var Oauth = require('../../models').Oauth;
var Follow = require('../../models').Follow;

var Validate = require('../../common/validate');
var xss = require('xss');
var async = require('async');



function changeString(str) {
  var length = str.length
  var s = ''

  if (length == 1) {
    return '*'
  } else if (length == 2) {
    return str.substring(0,1)+'*'
  } else if (length <= 5) {
    var l = 1
  } else {
    var l = 2
  }

  var _str = str.substring(l,length-l)
  var _s = ''
  for (var i = 0, max = _str.length; i < max; i++) {
    _s += '*'
  }
  return str.replace(_str,_s);

}


exports.fetch = function(req, res, next) {

  var user = req.user

  user = JSON.stringify(user);
  user = JSON.parse(user);

  // if (user.avatar) {
  //   user.avatar_url += '?_t=' + new Date().getTime();
  // }

  async.waterfall([
    function(callback) {

      Account.fetchByUserId(user._id, function(err, account){

        if (account) {
          var arr = account.email.split("@");
          var email = changeString(arr[0])+'@'+arr[1];
          user.email = email;
          user.email_verify = account.email_verify;
        }

        callback(null)
      })

    },
    function(callback) {
      Oauth.fetchByUserIdAndSource(user._id, 'weibo', function(err, oauth){
        if (err) console.log(err)
        user.weibo = oauth && oauth.deleted == false ? true : false
        callback(null)
      })
    },
    function(callback) {
      Oauth.fetchByUserIdAndSource(user._id, 'qq', function(err, oauth){
        if (err) console.log(err)
        user.qq = oauth && oauth.deleted == false ? true : false
        callback(null)
      })
    },
    function(callback) {
      Oauth.fetchByUserIdAndSource(user._id, 'github', function(err, oauth){
        if (err) console.log(err)
        user.github = oauth && oauth.deleted == false ? true : false
        callback(null)
      })
    },
    function(callback) {
      delete user.follow_node;
      delete user.follow_people;
      // delete user.avatar;
      delete user.id;
      // 删除一些字段
      callback(null)
    }
  ],
  function(err, result){
    res.send({
      success: true,
      data: user
    })
  })



};

exports.add = function(req, res, next) {
};

exports.update = function(req, res, next) {
};

exports.delete = function(req, res, next) {
};

exports.fetchById = function(req, res, next) {

  var user = req.user
  var id = req.params.id;

  async.waterfall([
    function(callback) {
      User.fetchById(id, function(err, people){
        if (err) console.log(err)
        if (!people) {
          callback(13000)
        } else {
          callback(null, people)
        }
      })
    },
    function(people, callback) {
      if (!user) {
        callback(null, people)
        return
      }

      people = JSON.stringify(people);
      people = JSON.parse(people);

      Follow.findOne({ user_id: user._id, people_id: people._id, deleted: false }, {}, function(err, data){
        if (err) console.log(err);
        if (data) {
          people.follow = true
        } else {
          people.follow = false
        }
        callback(null, people)
      })

    }
  ], function(err, result){
    if (err) {
      res.status(404);
      res.send({
        success: false,
        error: err
      });
    } else {
      res.send({
        success: true,
        data: result
      });
    }
  })

}

exports.resetAvatar = function(req, res, next) {

  var user = req.user;
  var avatar = req.body.avatar || '';

  if (avatar) {
    User.update({ _id: user._id }, { avatar: avatar }, function(err){
      if (err) console.log(err)
      res.send({
        success: true
      });
    })
  } else {
    res.status(400);
    res.send({
      success: false,
      error: 13008
    });
  }

}

exports.resetGender = function(req, res, next) {
  var user = req.user;
  var gender = req.body.gender || 0;

  if (gender == 1 || gender == 0) {
    User.resetGender(user._id, gender, function(err){
      res.send({
        success: true
      });
    });
  } else {
    res.status(400);
    res.send({
      success: false,
      error: 13001
    });
  }
}

exports.resetBrief = function(req, res, next) {

  var user = req.user;
  var brief = req.body.brief || '';

  if (brief.length > 80) {
    res.status(400);
    res.send({
      success: false,
      error: 13002
    });
  } else {
    User.resetBrief(user._id, brief, function(err){
      res.send({
        success: true
      });
    });
  }

}


// 更新昵称
exports.resetNickname = function(req, res) {

  var user = req.user;
  var nickname = req.body.nickname;

  // xss过滤
  nickname = xss(nickname, {
    whiteList: {},
    stripIgnoreTag: true,
    onTagAttr: function (tag, name, value, isWhiteAttr) {
      return '';
    }
  });

  // 如果用户名是error，或者ok，需要另外判断一下

  if (Validate.nickname(nickname) != 'ok') {

    res.status(400);
    res.send({
      success: false,
      error: 13003
    });

    return;
  }

  var countdown = Countdown(new Date(), user.nickname_reset_at)

  if (countdown.days > 0 || countdown.hours > 0 || countdown.mintues > 0) {

    if (user.nickname != '') {
      res.status(400);
      res.send({
        success: false,
        error_data: countdown,
        error: 13004
      })
      return;
    }

  }

  User.update({ _id: user._id }, { nickname: nickname, nickname_reset_at: new Date() }, (err)=>{
    if (err) console.log(err);
    res.send({
      success: true
    });

  })

  /*
  User.resetNickname(user._id, nickname, function(err){

    if (err) console.log(err);
    res.send({
      success: true
    });

  });
  */

}

function Countdown(nowDate, endDate) {

  var lastDate = Math.ceil(new Date(endDate).getTime()/1000)
  var now = Math.ceil(new Date(nowDate).getTime()/1000)

  var timeCount = (3600 * 24 * 30) - (now - lastDate)

  var days = parseInt( timeCount / (3600*24) )
  var hours = parseInt( (timeCount - (3600*24*days)) / 3600 )
  var mintues = parseInt( (timeCount - (3600*24*days) - (hours*3600)) / 60)
  var seconds = timeCount - (3600*24*days) - (3600*hours) - (60*mintues)

  return {
    days: days,
    hours: hours,
    mintues: mintues,
    seconds: seconds
  }

}
