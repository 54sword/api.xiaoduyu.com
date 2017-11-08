
var User = require('../../models').User;
var Account = require('../../models').Account;
// var Notification = require('../../models').Notification;
var Oauth = require('../../models').Oauth;
var Follow = require('../../models').Follow;
var Phone = require('../../models').Phone;
var Captcha = require('../../models').Captcha;

var Validate = require('../../common/validate');
var xss = require('xss');
var async = require('async');
var bcrypt = require('bcryptjs');
var uuid = require('node-uuid');

var Tools = require('../../common/tools');


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
    (callback) => {
      Phone.findOne({
        query: { user_id: user._id },
        callback: (err, result) => {
          if (err) console.log(err)
          user.phone = result ? changeString(result.phone + '') : ''
          callback(null)
        }
      })
    },
    function(callback) {
      delete user.follow_node;
      delete user.follow_people;
      // delete user.avatar;
      delete user.id;
      delete user.password;
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


/**
 * @api {post} /v1/reset-password 重置密码
 * @apiName Password
 * @apiGroup Password
 * @apiVersion 1.0.0
 *
 * @apiParam {String} token 访问令牌
 * @apiParam {String} current_password 当前密码
 * @apiParam {String} new_password 新密码
 *
 * @apiSuccess {String} err 错误信息，如果为空，则发送成功
 *
 * @apiSuccessExample 成功:
 * HTTP/1.1 200 OK
 * {
 *   	"err": ''
 * }
 */
exports.resetPassword = function(req, res) {

  var user = req.user,
      currentPassword = req.body.current_password || '',
      newPassword = req.body.new_password || '';

  async.waterfall([
    function(callback) {
      if (currentPassword === newPassword) {
        callback(13017);
      } else {
        // var result = Validate.password(newPassword);
        if (Validate.password(newPassword) != 'ok') {
          callback(13013);
        } else {
          callback(null);
        }
      }
    },
    /*
    function(callback) {
      Account.fetchByUserId(user._id, function(err, account){
        if (err) console.log(err);
        if (!account) {
          callback(13000);
        } else {
          callback(null, account);
        }
      });
    },
    */
    function(callback) {

      bcrypt.compare(currentPassword, user.password, function(err, res){
        if (err) console.log(err);
        if (!res) {
          callback(13018);
        } else {
          callback(null);
        }
      });

    },

    function(callback) {

      bcrypt.genSalt(10, function(err, salt) {
        if (err) return next(err);

        bcrypt.hash(newPassword, salt, function(err, hash) {
          if (err) return next(err);
          callback(null, hash)
        });
      });

    },

    function(_password, callback) {
      User.update({ _id: user._id }, { password: _password, access_token: uuid.v4() }, function(err){
        if (err) console.log(err);
        callback(null);
      })
    }
  ], function(err){

    if (err) {
      res.status(400);
      return res.send({
        success: false,
        error: err
      });
    }

    return res.send({
      success: true
    });

  });

};


// 通过验证码修改密码
exports.resetPasswordByCaptcha = function(req, res, next) {

  var email = req.body.email;
  var phone = req.body.phone;
  var newPassword = req.body.new_password;
  var captcha = req.body.captcha;
  const ip = Tools.getIP(req);

  async.waterfall([

    function(callback) {
      if (!email && !phone) callback(13023)
      else if (!newPassword) callback(13006)
      else if (!captcha) callback(13010)
      else if (!ip) callback(10000)
      else callback(null)
    },

    (callback) => {

      if (!email) return callback(null, null)

      // 查找是否有验证码
      Captcha.findOne({
        query:{ email },
        options:{ sort:{ create_at: -1 } },
        callback: (err, result)=>{
          if (err) console.log(err);
          if (!result) return callback(40001)
          callback(null, result)
        }
      })

    },

    (_captcha, callback) => {

      if (!phone) return callback(null, _captcha)

      // 查找是否有验证码
      Captcha.findOne({
        query:{ phone },
        options:{ sort:{ create_at: -1 } },
        callback: (err, result)=>{
          if (err) console.log(err);
          if (!result) return callback(40002)
          callback(null, result)
        }
      })

    },

    (_captcha, callback)=>{

      if (!_captcha || _captcha.captcha != captcha) return callback(40000)

      if (email) {
        Account.fetchByEmail(email, function(err, account){
          if (err) console.log(err);
          callback(null, account.user_id)
        })
      } else {

        Phone.findOne({
          query: { phone },
          options: { populate: { path: 'user_id' } },
          callback: function(err, account){
            if (err) console.log(err);
            callback(null, account.user_id)
          }
        })

      }

    },

    (user, callback) => {

      if (!user) return callback(13000)

      bcrypt.genSalt(10, function(err, salt) {
        if (err) return callback(err);

        bcrypt.hash(newPassword, salt, function(err, hash) {
          if (err) return callback(err);

          User.update({ _id: user._id }, { password: hash }, function(err, password){
            if (err) console.log(err);

            if (phone) {
              Captcha.remove({ condition: { phone } })
            } else if (email) {
              Captcha.remove({ condition: { email } })
            }

            callback(null)

          })

        })
      })

    }

  ], function(err, result){
    if (err) {
      // 账号的邮箱已经验证
      res.status(400);
      return res.send({
        success: false,
        error: err
      })
    }

    res.send({ success: true })
  })

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
