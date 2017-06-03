
var bcrypt = require('bcryptjs');
var async = require('async');
var xss = require('xss');

// var jwt = require('jwt-simple');

var Account = require('../../models').Account;
var User = require('../../models').User;
var Captcha = require('../../models').Captcha;

var JWT = require('../../common/jwt');
var Email = require('../../common/email');
var config = require('../../../config');

var Validate = require('../../common/validate');
var Tools = require('../../common/tools');


// 账号登录
exports.signin = function(req, res, next) {

  var ip = Tools.getIP(req);
  var email = req.body['email'];
  var password = req.body['password'];
  var captcha = req.body['captcha'] || '';
  var captchaId = req.body['captcha_id'] || '';
  console.log(req.body);

  async.waterfall([
    function(callback) {
      if (!email) {
        callback(13005);
      } else if (!password) {
        callback(13006);
      } else {
        callback(null);
      }
    },

    function(callback) {

      Captcha.findOne({ ip: ip }, { _id: 1 }, { sort:{ create_at: -1 } },function(err, result){
        if (err) console.log(err);

        if (!result) {
          callback(null)
          return
        }

        if (captcha && captchaId) {

          Captcha.findOne(
            { _id: captchaId },
            {},
            {},
            function(err, result){
              if (err) console.log(err);

              // 不需要验证
              if (result && result.captcha == captcha) {
                callback(null)
              } else {
                callback(13010)
              }
            }
          )

        } else {
          callback(13010)
        }

      })
    },

    function(callback) {

      Account.fetchByEmail(email, function(err, account){

        if (err) console.log(err);

        if (account) {
          Account.verifyPassword(password, account.password, function(bl, s){

            if (bl) {

              User.fetch({ _id: account.user_id }, {}, {}, function(err, user){
                if (err) { console.log(err); }

                user = user[0]

                var result = JWT.encode(req.jwtTokenSecret, user._id, user.access_token)

                callback(null, result)

              });

            } else {
              callback(13007);
            }
          });
        } else {
          callback(13007);
        }
      });

    }
  ], function(err, result){

    var meg = {};

    if (err) {
      res.status(400);
      meg.success = false;
      meg.error = err;

      var code = Math.round(900000*Math.random()+100000);
      var ip = Tools.getIP(req);

      // console.log(ip);

      //  type:1,
      Captcha.add({ captcha: code, ip:ip }, function(err){
        if (err) console.log(err);
      })

    } else {
      meg.success = true;
      meg.data = result;
    }
    res.send(meg);
  });

};

exports.signup = function(req, res, next) {

  // 用户信息
  var user = {
    nickname: req.body.nickname || '',
    email: req.body.email.toLowerCase() || '',
    password: req.body.password || '',
    gender: parseInt(req.body.gender),
    source: parseInt(req.body.source) || 0,
    captcha: req.body.captcha || '',
    createDate: new Date()
  };

  async.waterfall([
    function(callback) {

      // xss过滤
      user.nickname = xss(user.nickname, {
        whiteList: {},
        stripIgnoreTag: true,
        onTagAttr: function (tag, name, value, isWhiteAttr) { return ''; }
      });

      // 验证信息
      var checkResult = {};

      if (Validate.nickname(user.nickname) != 'ok') {
        checkResult.nickname = 13011
      }

      if (Validate.email(user.email) != 'ok') {
        checkResult.email = 13012
      }

      if (Validate.password(user.password) != 'ok') {
        checkResult.password = 13013
      }

      if (Validate.gender(user.gender) != 'ok') {
        checkResult.gender = 13014
      }

      var err = false;

      for (var i in checkResult) {
        if (checkResult[i]) {
          err = true;
        }
      }

      if (err) {
        callback(checkResult)
      } else {
        callback(null, checkResult);
      }

    },
    function(checkResult, callback) {

      Account.fetchByEmail(user.email, function(err, doc){

        if (err) console.log(err);

        if (doc) {
          checkResult.email = 13009;
          callback(checkResult);
          return;
        } else {
          callback(null, checkResult);
        }

      });

    },
    function(checkResult, callback) {

      Captcha.fetchByEmail(user.email, function(err, captcha){
        if (err) console.log(err)
        if (captcha && captcha.captcha == user.captcha) {
          callback(null, checkResult)
        } else {
          checkResult.captcha = 13010;
          callback(checkResult);
        }
      })

    },
    function(checkResult, callback) {

      // create user accounts
      User.create(user, function(err, doc){

        if (err) console.log(err);

        Account.create({
            user_id: doc._id,
            email: user.email,
            password: user.password
          },

          function(err, acc){

            if (err) console.log(err);
            callback(null);

        });

      });

    }
  ], function(err, result){
    if (err) {
      res.status(400);
      res.send({
        success: false,
        error: err
      })
    } else {
      res.send({
        success: true
      })
    }
  })

};


/**
 * 发送验证邮件
 * @param  {string}   domain              网站地址
 * @param  {string}   email               邮箱地址
 * @param  {number}   createDateTimestamp 账号创建日期的时间戳
 * @param  {string}   nickname            昵称
 * @param  {Function} callback            回调函数
 */
function sendVerifyEmail(domain, email, createDateTimestamp, nickname, callback) {

  bcrypt.hash(email+createDateTimestamp, 10, function(err, hash){
    if (err) console.log(err);

    var JSONData = {
      email: email,
      code: hash
    };

    // 验证码
    var verificationCode = new Buffer(JSON.stringify(JSONData)).toString('base64');

    var url = domain+'/signup-email-verify/'+verificationCode;

    var subject = '欢迎注册'+config.name;

    var textContent = '亲爱的 '+nickname+' 用户<br />'+
                      '点击下面的链接，完成激活<br />'+url;

    var htmlContent = '<p>亲爱的 '+nickname+' 用户</p>'+
                      '<p>点击下面的链接，完成激活</p>'+
                      '<a href="'+url+'">'+url+'</a>';

    var mailOptions = {
      to: email,
      subject: subject,
      text: textContent,
      html: htmlContent
    };

    Email.send(mailOptions, callback);

  });


};


// 发送验证码到账号邮箱，以验证是否有该邮箱的拥有权
exports.sendEmailVerifyCaptcha = function(req, res, next) {

  var user = req.user;
  var account = req.account;

  async.waterfall([

    function(callback) {
      Account.fetchByUserId(user._id, function(err, account){
        if (err) console.log(err);
        if (!account) {
          callback(13000);
        } else {
          if (account.email_verify) {
            // 账号的邮箱已经验证
            callback(13015);
          } else {
            callback(null, account);
          }
        }
      });
    },

    // 更新验证码到数据库
    function(account, callback) {
      var captcha = Math.round(900000*Math.random()+100000);
      Account.updateEmailVerifyCaptcha(account._id, captcha, function(err){
        if (err) {
          console.log(err);
          callback(13010);
        } else {
          callback(null, account, captcha);
        }
      });
    },

    // 发送邮件
    function(account, captcha, callback) {

      var subject = '请输入验证码 '+captcha+' 完成绑定邮箱';
      var textContent = '以下是您的验证码<div style="font-size:30px;">'+captcha+'</div><br />'+
              '您好 ' + user.nickname + ' !<br />'+
              '我们收到了来自您 '+ config.name + ' 帐号的安全请求，请使用上面的验证码验证您的帐号归属。<br /><br />'+
              '请注意: 为了保障您帐号的安全性，验证码1小时后过期，请尽快验证!';
      var htmlContent = textContent;

      var mailOptions = {
        to: account.email,
        subject: subject,
        text: textContent,
        html: htmlContent // html body
      };

      Email.send(mailOptions, function(err, response){
        if (err.message != 'success') {
          callback(13016);
        } else {
          callback(null);
        }
      });

    }

  ],
    function(err, result){

      if (err) {
        // 账号的邮箱已经验证
        res.status(400);
        return res.send({
          success: false,
          error: 13015
        });
      }

      res.send({ success: true });
    }
  );

};

// 验证账号邮箱的拥有权
exports.checkEmailVerifyCaptcha = function(req, res, next) {

  var user = req.user;
  var captcha = req.body.captcha;

  async.waterfall([

    function(callback) {
      Account.fetchByUserId(user._id, function(err, account){
        if (err) console.log(err);
        if (!account) {
          // 账号不存在
          callback(13000);
        } else {
          if (account.email_verify) {
            // 账号的邮箱已经验证
            callback(13015);
          } else {
            callback(null, account);
          }
        }
      });
    },

    function(account, callback) {

      var expire = new Date(account.verify_email_captcha_expire).getTime();
      var now = new Date().getTime();

      if (account.verify_email_captcha == captcha && now < expire) {
        Account.updateEmailVerify(account._id, true, function(err){
          if (err) console.log(err);
          callback(null);
        });
      } else {
        // 验证码错误
        callback(13010);
      }
    }

  ], function(err, result){

    if (err) {
      // 账号的邮箱已经验证
      res.status(400);
      return res.send({
        success: false,
        error: 13015
      });
    }

    res.send({ success: true });
  });

};

// http://localhost:3000/signup-email-verify
// 登陆邮箱验证
exports.signupEmailVerify = function(req, res) {

  var code = req.body.code;
  var json = new Buffer(code, 'base64').toString();

  try {

    json = JSON.parse(json);

    Account.fetchByEmail(json.email, function(err, user){

      if (err) console.log(err);
      if (!user) {
        res.status(400);
        return res.send({
          success: false,
          error: 13010
        });
      }

      if (user.email_verify) {
        res.status(400);
        return res.send({
          success: false,
          error: 13015
        });
      }

      var createDate = new Date(user.user_id.create_at).getTime();  // 创建日期的时间戳

      bcrypt.compare(user.email + createDate, json.code, function(err, result){
        if (err) console.log(err);
        if (result) {
          Account.updateEmailVerify(user._id, true, function(err){
            if (err) console.log(err);
            return res.send({
              success: true,
              data: {
                access_token: user.user_id.access_token
              }
            });
          });
        } else {
          res.status(400);
          return res.send({
            success: false,
            error: 13010
          });
        }
      });

    });

  } catch (err) {
    res.status(400);
    return res.send({
      success: false,
      error: 13010
    });
  }

};


/**
 * @api {get} /v1/reset-password 重置密码
 * @apiName Password
 * @apiGroup Password
 * @apiVersion 1.0.0
 *
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

    function(account, callback) {
      Account.verifyPassword(currentPassword, account.password, function(result){
        if (!result) {
          callback(13018);
        } else {
          Account.resetPassword(account._id, newPassword, function(err, password){
            if (err) console.log(err);

            User.updateAccessTokenById(user._id, function(err){
              if (err) console.log(err);
              callback(null);
            })

          });
        }
      });
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

// 检测新邮箱，邮箱地址正确，则发送验证码
exports.checkEmailAndSendVerifyCaptcha = function(req, res, next) {

  var user = req.user;
  var email = req.body.email;

  async.waterfall([

    function(callback) {
      var result = Validate.email(email);
      if (result != 'ok') {
        callback(result);
      } else {
        callback(null);
      }
    },

    function(callback){
      Account.fetchByEmail(email, function(err, account){
        if (err) console.log(err);
        if (account) {
          callback(13009);
        } else {
          callback(null);
        }
      });
    },

    function(callback) {
      Account.fetchByUserId(user._id, function(err, account){
        if (err) console.log(err);
        if (!account) {
          // 账号不存在
          callback(13000);
        } else {
          callback(null, account);
        }
      });
    },

    function(account, callback) {

      Account.setRepaceEmail(account._id, email, function(err){

        if (!err) console.log(err);

        var captcha = Math.round(900000*Math.random()+100000);
        Account.updateEmailVerifyCaptcha(account._id, captcha, function(err){
          if (err) {
            console.log(err);
            callback(13019);
          } else {
            callback(null, captcha);
          }
        });

      });

    },

    function(captcha, callback) {

      var subject = '请输入验证码 '+captcha+' 完成绑定邮箱';
      var textContent = '<p>'+user.nickname + ' 你好</p>'+
              '<p>你正在请求修改邮箱，请在 30 分钟内输入以下验证码完成绑定。 如非你本人操作，请忽略此邮件。</p>'+
              '<div style="font-size:30px; padding:10px;">'+captcha+'</div>';
      var htmlContent = textContent;
      var mailOptions = {
        to: email,
        subject: subject,
        text: textContent,
        html: htmlContent // html body
      };

      Email.send(mailOptions, function(err, response){
        if (err.message != 'success') {
          callback(13020);
        } else {
          callback('');
        }
      });

    }
  ],function(err, result){

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

    // res.send({ err: result });
  });

};

// 修改邮箱
exports.resetEmail = function(req, res, next) {

  var user = req.user;
  var email = req.body.email;
  var captcha = req.body.captcha;
  var meg = { err: '' };

  async.waterfall([

    function(callback) {
      if (!email || !captcha) {
        callback(10005);
      } else {
        if (Validate.email(email) != 'ok') {
          callback(13012);
        } else {
          callback(null);
        }
      }
    },

    function(callback) {
      Account.fetchByUserId(user._id, function(err, account){
        if (err) console.log(err);
        if (!account) {
          // 账号不存在
          callback(13000);
        } else {
          callback(null, account);
        }
      });
    },

    function(account, callback) {

      Captcha.fetchByUserId(user._id, function(err, _captcha){
        if (err) console.log(err)
        if (_captcha && _captcha.captcha == captcha && _captcha.email == email) {

          Account.updateEmail(account._id, email, function(err){
            if (err) console.log(err);
            callback(null);
          });

        } else {
          // checkResult.captcha = 'captcha error';
          callback(13010);
        }
      })

      /*
      var expire = new Date(account.verify_email_captcha_expire).getTime();
      var now = new Date().getTime();

      if (account.verify_email_captcha == captcha && now < expire &&
        account.replace_email == email
      ) {

        Account.updateEmail(account._id, email, function(err){
          if (err) console.log(err);
          callback('');
        });

      } else {
        callback('captcha error');
      }
      */
    }

  ], function(err, result){
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
    // res.send({ err: result });
  });

};


// 通过验证码修改密码
exports.resetPasswordByCaptcha = function(req, res, next) {

  var email = req.body.email;
  var newPassword = req.body.new_password;
  var captcha = req.body.captcha;

  async.waterfall([

    function(callback) {
      if (!email) {
        callback(10005);
      } else {
        // var result = Validate.email(email);
        if (Validate.email(email) != 'ok') {
          callback(13012);
        } else {
          callback(null);
        }
      }
    },

    function(callback) {
      Account.fetchByEmail(email, function(err, account){
        if (err) console.log(err)
        if (!account) {
          callback(13000);
        } else {
          callback(null, account)
        }
      });
    },

    function(account, callback) {

      Captcha.fetchByEmail(email, function(err, _captcha){
        if (err) console.log(err)
        if (_captcha && _captcha.captcha == captcha) {

          Account.resetPassword(account._id, newPassword, function(err, password){
            if (err) console.log(err);
            callback(null);
          });

        } else {
          // checkResult.captcha = 13010;
          callback(13010);
        }
      })

      /*
      var expire = new Date(account.verify_email_captcha_expire).getTime();
      var now = new Date().getTime();

      if (account.verify_email_captcha == captcha && now < expire &&
        account.replace_email == email
      ) {

        Account.resetPassword(account._id, newPassword, function(err, password){
          if (err) console.log(err);
          callback(null);
        });

      } else {
        callback('captcha error');
      }
      */
    }

  ], function(err, result){
    if (err) {
      // 账号的邮箱已经验证
      res.status(400);
      return res.send({
        success: false,
        error: err
      });
    }

    res.send({ success: true });
  });

}

// 绑定邮箱
exports.bindingEmail = function(req, res, next) {

  var user = req.user;
  var email = req.body.email;
  var captcha = req.body.captcha;
  var password = req.body.password;

  async.waterfall([
    function(callback) {
      Captcha.fetchByEmail(email, function(err, _captcha){

        if (_captcha && _captcha.user_id + '' == user._id + '' && _captcha.captcha == captcha) {
          callback(null)
          return
        }

        callback(13010)

      });
    },
    function(callback) {

      Account.create({
          user_id: user._id,
          email: email,
          password: password
        },
        function(err, acc){
          if (err) console.log(err);
          callback(null);
      });

    }
  ], function(err, result){

    if (err) {
      // 账号的邮箱已经验证
      res.status(400);
      return res.send({
        success: false,
        error: err
      });
    }

    res.send({ success: true });

  })

}

// 发送验证码到邮箱
exports.sendEmailCaptcha = function(req, res, next) {

  var email = req.body.email;
  var type = req.body.type;

  async.waterfall([

    function(callback) {
      if (!email) {
        callback(10005);
      } else {
        // var result = Validate.email(email);
        if (Validate.email(email) != 'ok') {
          callback(13012);
        } else {
          callback(null);
        }
      }
    },

    function(callback) {
      Account.fetchByEmail(email, function(err, account){
        if (err) console.log(err)
        if (!account) {
          callback(13000);
        } else {
          callback(null, account)
        }
      });
    },

    // 更新验证码到数据库
    function(account, callback) {
      var captcha = Math.round(900000*Math.random()+100000);
      Account.updateEmailVerifyCaptcha(account._id, captcha, function(err){
        if (err) {
          console.log(err);
          callback(13019);
        } else {
          callback(null, account, captcha);
        }
      });
    },

    function(account, captcha, callback) {

      var subject = '请输入验证码 '+captcha+' 完成密码修改';
      var textContent = '<p>'+account.user_id.nickname + ' 你好</p>'+
              '<p>你正在请求修改密码，请在 30 分钟内输入以下验证码完成绑定。 如非你本人操作，请忽略此邮件。</p>'+
              '<div style="font-size:30px; padding:10px;">'+captcha+'</div>';
      var htmlContent = textContent;
      var mailOptions = {
        to: email,
        subject: subject,
        text: textContent,
        html: htmlContent // html body
      };

      Email.send(mailOptions, function(err, response){
        if (err.message != 'success') {
          callback(13020);
        } else {
          callback(null);
        }
      });

    }

  ], function(err, result){

    if (err) {
      // 账号的邮箱已经验证
      res.status(400);
      return res.send({
        success: false,
        error: err
      });
    }

    res.send({ success: true });
  });

};
