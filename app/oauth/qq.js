
var request = require('request');
var xss = require('xss');
var async = require('async');
// var jwt = require('jwt-simple');
var JWT = require('../common/jwt');

var User = require('../models').User;
var Oauth = require('../models').Oauth;
var Tools = require('../common/tools');
// var auth = require('../middlewares/auth');
var mkdirs = require('../common/mkdirs');
var Avatar = require('../api/v1/avatar');

// var Avatar = require('../controllers/avatar');
var config = require('../../configs/config');

var appConfig = {
  appid: config.oauth.qq.appid,
  appkey: config.oauth.qq.appkey,
  redirectUri: config.domain+'/oauth/qq-signin',
  scope: 'get_user_info'
}

var goToNoticePage = function(res, string) {
  res.redirect('https://www.xiaoduyu.com/notice?source=oauth_qq&notice='+string)
}

var goToAutoSignin = function(res, jwtTokenSecret, userId) {
  var result = JWT.encode(jwtTokenSecret, userId)
  res.redirect('https://www.xiaoduyu.com/oauth?access_token='+result.access_token+'&expires='+result.expires)
}

// 打开QQ登录接入页面
exports.show = function(req, res, next) {
  var csrf = Math.round(900000*Math.random()+100000);

  var opts = {
    httpOnly: true,
    path: '/',
    maxAge: 1000 * 60 * 2
  };
  res.cookie('csrf', csrf, opts);
  res.cookie('access_token', req.query.access_token || '', opts);

  // req.session.csrf = csrf;
  // req.session.access_token = req.query.access_token || '';
  res.redirect('https://graph.qq.com/oauth2.0/authorize?response_type=code&state='+csrf+'&client_id='+appConfig.appid+'&redirect_uri='+encodeURIComponent(appConfig.redirectUri)+'&scope='+appConfig.scope);
};

// 登陆验证
// http://wiki.connect.qq.com/使用authorization_code获取access_token
exports.signin = function(req, res) {

  var user = null;
  var code = req.query.code;
  var state = req.query.state;
  var user_access_token = req.cookies['access_token']; //req.session.access_token;

  // 避免csrf攻击
  if (req.cookies['csrf'] != state) {
    res.redirect(config.domain+'/oauth/qq');
    return;
  }

  async.waterfall([

    function(callback) {

      // 如果带有 access_token 那么，判断 access_token 是否有效

      if (!user_access_token) {
        callback(null)
        return
      }

      var decoded = JWT.decode(user_access_token, req.jwtTokenSecret);

      if (decoded && decoded.expires > new Date().getTime()) {
        // 判断 token 是否有效
        User.fetch({ _id: decoded.user_id }, {}, {}, function(err, user){
          if (err) console.log(err);
          if (user && user[0]) {
            user = user[0];
            callback(null);
          } else {
            goToNoticePage(res, 'wrong_token');
          }
        });
      } else {
        goToNoticePage(res, 'wrong_token');
      }

      /*
      User.fetchByAccessToken(user_access_token, function(err, _user){
        if (err) console.log(err)
        if (_user) {
          user = _user
          callback(null)
        } else {
          goToNoticePage(res, 'wrong_token')
        }
      })
      */

    },

    // 获取访问令牌
    function(callback) {
      getAccessToken(code, function(err, tokenInfo){
        if (!tokenInfo) {
          res.redirect(appConfig.redirectUri);
        } else {
          callback(null, tokenInfo);
        }
      });
    },

    // 获取 openid
    function(tokenInfo, callback) {
      getOpenId(tokenInfo.access_token, function(err, openid){
        if (err) {
          res.send(err);
          res.redirect(appConfig.redirectUri);
        } else {
          tokenInfo.openid = openid;
          callback(null, tokenInfo);
        }
      });
    },

    // 查询 openid 是否已经存在
    function(tokenInfo, callback) {
      Oauth.fetchByOpenIdAndSource(tokenInfo.openid, 'qq', function(err, oauth){
        if (err) console.log(err);
        callback(null, tokenInfo, oauth);
      });
    },

    function(tokenInfo, oauth, callback) {

      if (user && oauth && oauth.deleted == false) {
        // 绑定失败，账号已经被绑定
        goToNoticePage(res, 'has_been_binding')
      } else if (user && oauth && oauth.deleted == true) {

        // 已经存在的 oauth
        Oauth.updateById(oauth._id, {
          access_token: tokenInfo.access_token,
          expires_in: tokenInfo.expires_in,
          refresh_token: tokenInfo.refresh_token,
          user_id: user._id,
          deleted: false
        }, function(err){
          if (err) {
            console.log(err)
            goToNoticePage(res, 'binding_failed')
          } else {
            goToNoticePage(res, 'binding_finished')
          }
        })

      } else if (user && !oauth) {
        // 绑定到账户
        var qq = {
          openid: tokenInfo.openid,
          access_token: tokenInfo.access_token,
          expires_in: tokenInfo.expires_in,
          refresh_token: tokenInfo.refresh_token,
          source: 'qq',
          user_id: user._id
        };

        Oauth.create(qq, function(err, user){
          if (err) console.log(err);
          goToNoticePage(res, 'binding_finished')
        });

      } else if (!user && oauth && oauth.deleted == false) {
        // 登录
        goToAutoSignin(res, req.jwtTokenSecret, oauth.user_id._id)
      } else if (!user && !oauth) {

        // 创建 user，并绑定

        getUserinfo(tokenInfo.access_token, appConfig.appid, tokenInfo.openid, function(user_info){

          tokenInfo.nickname = user_info.nickname;
          tokenInfo.gender = user_info.gender;
          tokenInfo.year = user_info.year;
          tokenInfo.avatar = user_info.figureurl_qq_2;
          tokenInfo.createDate = new Date();
          tokenInfo.gender = user_info.gender == '男' ? 1 : 0;
          tokenInfo.source = 4;

          createUser(tokenInfo, function(user){
            if (!user) {
              goToNoticePage(res, 'create_user_failed')
              return
            }

            createOauth(tokenInfo, user, function(oauth){
              if (oauth) {

                updateAvatar(tokenInfo.avatar, user, function(){
                  goToAutoSignin(res, req.jwtTokenSecret,  user._id)
                })

              } else {
                goToNoticePage(res, 'create_oauth_failed')
              }
            })

          })

        });

      } else if (!user && oauth && oauth.deleted == true) {

        // oauth 是删除状态，绑定新账户，并恢复成可用状态

        getUserinfo(tokenInfo.access_token, appConfig.appid, tokenInfo.openid, function(user_info){

          tokenInfo.nickname = user_info.nickname;
          tokenInfo.gender = user_info.gender;
          tokenInfo.year = user_info.year;
          tokenInfo.avatar = user_info.figureurl_qq_2;
          tokenInfo.createDate = new Date();
          tokenInfo.gender = user_info.gender == '男' ? 1 : 0;
          tokenInfo.source = 4;

          createUser(tokenInfo, function(user){
            if (user) {
              Oauth.updateById(oauth._id, { user_id: user._id, deleted: false }, function(){

                updateAvatar(tokenInfo.avatar, user, function(){
                  goToAutoSignin(res, req.jwtTokenSecret, user._id)
                })

              })
            } else {
              goToNoticePage(res, 'create_oauth_failed')
            }
          })

        });

      }
    }

  ], function(err, result) {

  });

};

// 解除绑定
exports.unbinding = function(req, res, next) {

  var access_token = req.body.access_token

  async.waterfall([
    function(callback) {

      var decoded = JWT.decode(access_token, req.jwtTokenSecret);

      if (decoded && decoded.expires > new Date().getTime()) {
        // 判断 token 是否有效
        User.fetch({ _id: decoded.user_id }, {}, {}, function(err, user){
          if (err) console.log(err);
          if (user && user[0]) {
            callback(null, user[0]);
          } else {
            goToNoticePage('access token error');
          }
        });
      } else {
        goToNoticePage('access token error');
      }

    },

    function(user, callback) {
      // 查询是否存在
      Oauth.fetchByUserIdAndSource(user._id, 'qq', function(err, oauth){
        if (err) console.log(err);
        if (!oauth) {
          callback('not binding qq');
        } else {
          callback(null, oauth);
        }
      });
    },

    function(oauth, callback) {
      // 标记删除状态
      Oauth.updateDeleteStatus(oauth._id, true, function(err){
        if (err) {
          console.log(err);
          callback('unbinding failed');
        } else {
          callback(null);
        }
      });
    }
  ], function(err, result){

    if (err) {
      res.status(401);
      res.send({
        success: false,
        error: err
      });
    } else {
      res.send({
        success: true
      });
    }

  });

};

// 获取用户的openid
var getOpenId = function(access_token, callback) {

  request.get(
    'https://graph.qq.com/oauth2.0/me?access_token='+access_token,
    {},
    function (error, response, body) {
      if (!error && response.statusCode == 200) {

        var star = body.indexOf('(')+1;
        var end = body.lastIndexOf(')');
        var body = body.substring(star, end);
        var info = JSON.parse(body);

        if (info.openid) {
          callback(null, info.openid);
        } else {
          callback('openid get failed', null);
        }

      } else {
        callback(error || response.statusCode, null);
      }
    }
  );

};

// 获取 access token
var getAccessToken = function(code, callback) {

  request.get(
    'https://graph.qq.com/oauth2.0/token?grant_type=authorization_code&client_id='+appConfig.appid+'&client_secret='+appConfig.appkey+'&code='+code+'&redirect_uri=http%3A%2F%2Fapi.xiaoduyu.com%2Foauth%2Fqq',
    {},
    function (error, response, body) {
      if (error || response.statusCode != 200) {
        // 获取失败
        callback(error || response.statusCode, null);
        return;
      }

      var params = [];
      var str = body;
      var strs = str.split("&");

      for (var i = 0, max = strs.length; i < max; i++) {
        var a = strs[i].split("=");
        params[a[0]] = a[1];
      }

      callback(null, params);
    }
  );

};


// 获取用户的信息
var getUserinfo = function(access_token, appid, openid, callback) {

  request.get(
    'https://graph.qq.com/user/get_user_info?access_token='+access_token+'&oauth_consumer_key='+appid+'&openid='+openid,
    {},
    function (error, response, body) {

      if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        callback(info);
      } else {
        callback(null);
      }
    }
  );

};


// 重新获取token
var refreshToken = function(refresh_token, callback) {

  request.get(
    'https://graph.qq.com/oauth2.0/token?grant_type=refresh_token&client_id='+appConfig.appid+'&client_secret='+appConfig.appkey+'&refresh_token='+refresh_token,
    {},
    function (error, response, body) {
      if (!error && response.statusCode == 200) {

        var params = [];
        var str = body;
        var strs = str.split("&");

        for (var i = 0, max = strs.length; i < max; i++) {
          var a = strs[i].split("=");
          params[a[0]] = a[1];
        }

        if (params.access_token) {
          callback(true);
        } else {
          callback(false);
        }

      } else {
        callback(null);
      }
    }
  );

};


// 通过日期获取头像的存放路径
var avatarFolderPath = function(date) {

  var myDate = new Date(date);
  var year = myDate.getFullYear();
  var month = (myDate.getMonth()+1);
  var day = myDate.getDate();

  if (month < 10) month = '0'+month;
  if (day < 10) day = '0'+day;

  return year + '/' + month + '/' + day + '/';
};


var createUser = function(user, callback) {

  // xss过滤
  user.nickname = xss(user.nickname, {
    whiteList: {},
    stripIgnoreTag: true,
    onTagAttr: function (tag, name, value, isWhiteAttr) {
      return '';
    }
  });

  // 创建用户
  User.create(user, function(err, newUser){
    if (err) console.log(err);
    callback(newUser)
  });

}

var createOauth = function(user, newUser, callback) {

  user.user_id = newUser._id;
  user.source = 'qq';

  Oauth.create(user, function(err, oauth){
    if (err) console.log(err);
    callback(oauth);
  });

}

var updateAvatar = function(imageSource, user, callback) {

  var path = config.upload.avatar.path + avatarFolderPath(user.create_at);

  // 创建文件夹
  mkdirs(path, 0755, function(){
    // 下载头像图片
    Tools.download(imageSource, path, user._id + "_original.jpg", function(){
      // 裁剪头像
      Avatar.cropAvatar(null, 0, 0, 100, 100, user, function(){
        callback();
      });
    });
  });

}
