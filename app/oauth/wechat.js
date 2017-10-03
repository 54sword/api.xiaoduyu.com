
var request = require('request');
var xss = require('xss');
var async = require('async');
var JWT = require('../common/jwt');
var Tools = require('../common/tools');

var User = require('../models').User;
var Oauth = require('../models').Oauth;
var qiniu = require('../api/v1/qiniu');

var config = require('../../config');

var appConfig = {}

if (config.oauth.wechat) {
  appConfig = {
    appid: config.oauth.wechat.appid,
    appkey: config.oauth.wechat.appkey,
    redirectUri: config.domain+'/oauth/wechat-signin',
    scope: 'snsapi_userinfo'
  }
}


var goToNoticePage = function(req, res, string) {
  var landingPage = req.cookies['landing_page'] || config.oauth.landingPage;
  res.redirect(landingPage+'/notice?source=oauth_qq&notice='+string)
}

var goToAutoSignin = function(req, res, jwtTokenSecret, userId, accessToken) {
  var ip = Tools.getIP(req);
  var result = JWT.encode(jwtTokenSecret, userId, accessToken, ip);
  var landingPage = req.cookies['landing_page'] || config.oauth.landingPage;
  res.redirect(landingPage+'/oauth?access_token='+result.access_token+'&expires='+result.expires)
}

// 打开QQ登录接入页面
exports.show = function(req, res, next) {
  var csrf = Math.round(900000*Math.random()+100000);

  var opts = {
    httpOnly: true,
    path: '/',
    maxAge: 1000 * 60 * 5
  };

  // 设置登录成后的着陆页面
  let landingPage = ''
  if (req.query.landing_page) {
    landingPage = req.query.landing_page
  } else if (req.headers && req.headers.referer) {
    landingPage = req.headers.referer
  }

  res.cookie('csrf', csrf, opts);
  res.cookie('access_token', req.query.access_token || '', opts);
  res.cookie('landing_page', landingPage, opts);

  var url = 'https://open.weixin.qq.com/connect/oauth2/authorize'+
  '?appid='+appConfig.appid+
  '&redirect_uri='+encodeURIComponent(appConfig.redirectUri)+
  '&response_type=code'+
  '&scope='+appConfig.scope+
  '&state='+csrf+'#wechat_redirect'

  res.redirect(url)
};

exports.signin = function(req, res) {

  var user = null;
  var code = req.query.code;
  var state = req.query.state;
  var user_access_token = req.cookies['access_token']; //req.session.access_token;

  // 避免csrf攻击
  if (req.cookies['csrf'] != state) {
    res.redirect(config.domain+'/oauth/wechat');
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
        User.fetch({ _id: decoded.user_id }, {}, {}, function(err, _user){
          if (err) console.log(err);
          if (_user && _user[0]) {
            user = _user[0];
            callback(null);
          } else {
            goToNoticePage(req, res, 'wrong_token');
          }
        });
      } else {
        goToNoticePage(req, res, 'wrong_token');
      }

    },

    // 获取访问令牌
    function(callback) {
      getAccessToken(code, function(tokenInfo){
        if (!tokenInfo) {
          res.redirect(appConfig.redirectUri);
        } else {
          callback(null, tokenInfo);
        }
      });
    },

    // 获取用户资料
    function(tokenInfo, callback) {
      getUserinfo(tokenInfo, function(userinfo){
        if (!userinfo) {
          res.redirect(appConfig.redirectUri);
        } else {
          callback(null, tokenInfo, userinfo);
        }
      })
    },

    // 查询 openid 是否已经存在
    function(tokenInfo, userinfo, callback) {

      tokenInfo.backup_openid = tokenInfo.openid
      tokenInfo.openid = userinfo.unionid

      Oauth.fetchByOpenIdAndSource(tokenInfo.openid, 'wechat', function(err, oauth){
        if (err) console.log(err);
        callback(null, tokenInfo, userinfo, oauth);
      });
    },

    function(tokenInfo, userinfo, oauth, callback) {

      if (user && oauth && oauth.deleted == false) {
        // 绑定失败，账号已经被绑定
        goToNoticePage(req, res, 'has_been_binding')
      } else if (user && oauth && oauth.deleted == true) {

        // 恢复绑定
        Oauth.updateById(oauth._id, {
          access_token: tokenInfo.access_token,
          expires_in: tokenInfo.expires_in,
          refresh_token: tokenInfo.refresh_token,
          user_id: user._id,
          deleted: false
        }, function(err){
          if (err) {
            console.log(err)
            goToNoticePage(req, res, 'binding_failed')
          } else {
            goToNoticePage(req, res, 'binding_finished')
          }
        })

      } else if (user && !oauth) {

        // 已注册用户绑定微信
        createOauth(tokenInfo, user, function(oauth){
          if (err) console.log(err);
          goToNoticePage(req, res, 'binding_finished')
        })

      } else if (!user && oauth && oauth.deleted == false) {
        // 登录
        goToAutoSignin(req, res, req.jwtTokenSecret, oauth.user_id._id, oauth.user_id.access_token)
      } else if (!user && !oauth) {

        // 创建 user，并绑定

        var newUser = {
          nickname: userinfo.nickname,
          avatar: userinfo.headimgurl || '',
          createDate: new Date(),
          gender: userinfo.sex == 1 ? 1 : 0,
          source: 7
          // province: userinfo.province || '',
          // city: userinfo.city || '',
          // country: userinfo.country || ''
        }

        createUser(newUser, function(user){

          if (!user) {
            goToNoticePage(req, res, 'create_user_failed')
            return
          }

          createOauth(tokenInfo, user, function(oauth){
            if (oauth) {
              if (user.avatar) {
                qiniu.uploadImage(user.avatar, user._id, function(){
                  goToAutoSignin(req, res, req.jwtTokenSecret, user._id, user.access_token)
                })
              } else {
                goToAutoSignin(req, res, req.jwtTokenSecret, user._id, user.access_token)
              }
            } else {
              goToNoticePage(req, res, 'create_oauth_failed')
            }
          })

        })


      } else if (!user && oauth && oauth.deleted == true) {

        // oauth 是删除状态，绑定新账户，并恢复成可用状态

        var newUser = {
          nickname: userinfo.nickname,
          avatar: userinfo.headimgurl || '',
          createDate: new Date(),
          gender: userinfo.sex == 1 ? 1 : 0,
          source: 7
          // province: userinfo.province || '',
          // city: userinfo.city || '',
          // country: userinfo.country || ''
        }

        createUser(newUser, function(user){

          if (!user) {
            goToNoticePage(req, res, 'create_user_failed')
            return
          }

          Oauth.updateById(oauth._id,
            {
              access_token: tokenInfo.access_token,
              expires_in: tokenInfo.expires_in,
              refresh_token: tokenInfo.refresh_token,
              user_id: user._id,
              deleted: false
            },
            function(){
              if (oauth) {
                if (user.avatar) {
                  qiniu.uploadImage(user.avatar, user._id, function(){
                    goToAutoSignin(req, res, req.jwtTokenSecret, user._id, user.access_token)
                  })
                } else {
                  goToAutoSignin(req, res, req.jwtTokenSecret, user._id, user.access_token)
                }
              } else {
                goToNoticePage(req, res, 'create_oauth_failed')
              }
            }
          )

        })

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
            callback('access token error');
          }
        });
      } else {
        callback('access token error');
      }

    },

    function(user, callback) {
      // 查询是否存在
      Oauth.fetchByUserIdAndSource(user._id, 'wechat', function(err, oauth){
        if (err) console.log(err);
        if (!oauth) {
          callback('not binding wechat');
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


// 获取 access token
var getAccessToken = function(code, callback) {
  request.get(
    'https://api.weixin.qq.com/sns/oauth2/access_token?'+
    'appid='+appConfig.appid+
    '&secret='+appConfig.appkey+
    '&code='+code+
    '&grant_type=authorization_code',
    {},
    function (error, response, body) {
      if (body) body = JSON.parse(body);
      callback(body && !body.errcode ? body : null);
    }
  );
};


// 获取用户的信息
var getUserinfo = function(tokenInfo, callback) {

  request.get(
    'https://api.weixin.qq.com/sns/userinfo?access_token='+tokenInfo.access_token+'&openid='+tokenInfo.openid+'&lang=zh_CN',
    // 'https://api.weixin.qq.com/cgi-bin/user/info?access_token='+tokenInfo.access_token+'&openid='+tokenInfo.openid+'&lang=zh_CN',
    {},
    function (error, response, body) {
      if (body) body = JSON.parse(body);
      callback(body && !body.errcode ? body : null);
    }
  );
};

/*
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
*/


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
  user.source = 'wechat';

  Oauth.create(user, function(err, oauth){
    if (err) console.log(err);
    callback(oauth);
  });

}
