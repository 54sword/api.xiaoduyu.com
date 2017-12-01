
var request = require('request');
var xss = require('xss');
var async = require('async');
var JWT = require('../common/jwt');
var Tools = require('../common/tools');

var User = require('../models').User;
var Oauth = require('../models').Oauth;
var qiniu = require('../api/v1/qiniu');
var config = require('../../config');

var appConfig = {
  appid: config.oauth.qq.appid,
  appkey: config.oauth.qq.appkey,
  redirectUri: config.domain+'/oauth/qq-signin',
  scope: 'get_user_info'
}

var goToNoticePage = function(req, res, string) {
  // var landingPage = req.cookies['landing_page'] || config.oauth.landingPage;
  var landingPageDomain = req.cookies['landing_page_domain']
  res.redirect(landingPageDomain+'/notice?source=oauth_qq&notice='+string)
}

var goToAutoSignin = function(req, res, jwtTokenSecret, userId, accessToken) {
  var ip = Tools.getIP(req)
  var result = JWT.encode(jwtTokenSecret, userId, accessToken, ip)
  var landingPage = req.cookies['landing_page']
  var landingPageDomain = req.cookies['landing_page_domain']
  res.redirect(landingPageDomain+'/oauth?access_token='+result.access_token+'&expires='+result.expires+'&landing_page='+landingPage)
}

const signInAndSignUp = (user, authorize, _callback) => {

  async.waterfall([

    // 查询 openid 是否已经存在
    function(callback) {
      Oauth.fetchByOpenIdAndSource(authorize.openid, 'qq', function(err, oauth){
        if (err) console.log(err);
        callback(null, oauth);
      });
    },

    function(oauth, callback) {

      if (user && oauth && oauth.deleted == false) {
        // 绑定失败，账号已经被绑定
        callback('has_been_binding')
      } else if (user && oauth && oauth.deleted == true) {

        // 已经存在的 oauth
        Oauth.updateById(oauth._id, {
          access_token: authorize.access_token,
          expires_in: authorize.expires_in,
          refresh_token: authorize.refresh_token,
          user_id: user._id,
          deleted: false
        }, function(err){
          if (err) {
            console.log(err)
            callback('binding_failed')
          } else {
            callback('binding_finished')
          }
        })

      } else if (user && !oauth) {
        // 绑定到账户
        var qq = {
          openid: authorize.openid,
          access_token: authorize.access_token,
          expires_in: authorize.expires_in,
          refresh_token: authorize.refresh_token,
          source: 'qq',
          user_id: user._id
        };

        Oauth.create(qq, function(err, user){
          if (err) console.log(err);
          callback('binding_finished')
        });

      } else if (!user && oauth && oauth.deleted == false) {

        // 登录
        // goToAutoSignin(req, res, req.jwtTokenSecret, oauth.user_id._id, oauth.user_id.access_token)
        callback(null, { user_id: oauth.user_id._id, access_token: oauth.user_id.access_token })
      } else if (!user && !oauth) {

        // 创建 user，并绑定
        // console.log(authorize);
        // console.log(appConfig);


        getUserinfo(authorize.access_token, appConfig.appid, authorize.openid, function(user_info){

          // console.log(user_info);

          authorize.nickname = user_info.nickname;
          authorize.gender = user_info.gender;
          authorize.year = user_info.year;
          authorize.avatar = user_info.figureurl_qq_2;
          authorize.createDate = new Date();
          authorize.gender = user_info.gender == '男' ? 1 : 0;
          authorize.source = 4;

          createUser(authorize, function(user){
            if (!user) {
              callback('create_user_failed')
              return
            }

            createOauth(authorize, user, function(oauth){
              if (oauth) {
                qiniu.uploadImage(authorize.avatar, user._id, function(){
                  callback(null, { user_id: user._id, access_token: user.access_token })
                })
              } else {
                callback('create_oauth_failed')
              }
            })

          })

        });

      } else if (!user && oauth && oauth.deleted == true) {

        // oauth 是删除状态，绑定新账户，并恢复成可用状态

        getUserinfo(authorize.access_token, appConfig.appid, authorize.openid, function(user_info){

          authorize.nickname = user_info.nickname;
          authorize.gender = user_info.gender;
          authorize.year = user_info.year;
          authorize.avatar = user_info.figureurl_qq_2;
          authorize.createDate = new Date();
          authorize.gender = user_info.gender == '男' ? 1 : 0;
          authorize.source = 4;

          createUser(authorize, function(user){
            if (user) {
              Oauth.updateById(oauth._id, { user_id: user._id, deleted: false }, function(){

                qiniu.uploadImage(authorize.avatar, user._id, function(){
                  callback(null, { user_id: user._id, access_token: user.access_token })
                })

              })
            } else {
              callback('create_oauth_failed')
            }
          })

        })

      }
    }

  ], (err, info) => {
    if (err) {
      _callback(err)
    } else {
      _callback(null, info)
    }
  })

}

// 打开QQ登录接入页面
exports.show = function(req, res, next) {
  let csrf = Math.round(900000*Math.random()+100000);
  let opts = {
    httpOnly: true,
    path: '/',
    maxAge: 1000 * 60 * 5
  };

  // 设置登录成后的着陆页面
  let landingPage = config.oauth.landingPage
  if (req.headers && req.headers.referer) {
    landingPage = req.headers.referer
  }

  let domain = []

  let _arr = landingPage.split('/')

  domain.push(_arr[0])
  domain.push(_arr[1])
  domain.push(_arr[2])

  domain = domain.join('/')

  res.cookie('csrf', csrf, opts)
  res.cookie('access_token', req.query.access_token || '', opts)
  res.cookie('landing_page_domain', domain, opts)
  res.cookie('landing_page', landingPage, opts)

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

    function(tokenInfo, callback) {
      signInAndSignUp(user, tokenInfo, (err, result)=>{
        if (err) {
          goToNoticePage(req, res, err)
        } else {
          goToAutoSignin(req, res, req.jwtTokenSecret, result.user_id, result.access_token)
        }
      })
    }

  ], function(err, result) {

  });

};

exports.getUserInfo = (req, res, next) => {

  const user = req.user || null;

  const { qq_access_token, refresh_token = '', openid, expires_in } = req.body

  signInAndSignUp(user, {
    access_token: qq_access_token,
    expires_in: expires_in,
    refresh_token: refresh_token,
    openid: openid,
  }, (err, result)=>{
    if (err) {
      res.status(401);

      let _err = {
        binding_finished: 20000,
        binding_failed: 20001,
        create_user_failed: 20002,
        create_oauth_failed: 20003,
        has_been_binding: 20004
      }

      res.send({
        success: _err[err] == 20000 ? true : false,
        error: _err[err] || 10007
      })
    } else {
      res.send({
        success: true,
        data: JWT.encode(req.jwtTokenSecret, result.user_id, result.access_token)
      });
    }
  })

}

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
    'https://graph.qq.com/oauth2.0/token?grant_type=authorization_code&client_id='+appConfig.appid+'&client_secret='+appConfig.appkey+'&code='+code+'&redirect_uri='+encodeURIComponent(appConfig.redirectUri),
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
