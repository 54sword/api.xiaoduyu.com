
var request = require('request');
var xss = require('xss');
var async = require('async');
var JWT = require('../common/jwt');
var Tools = require('../common/tools');

var User = require('../models').User;
var Oauth = require('../models').Oauth;
// var mkdirs = require('../common/mkdirs');
// var Avatar = require('../api/v1/avatar');
var qiniu = require('../api/v1/qiniu');

var config = require('../../config');
// var Tools = require('../common/tools');
// var auth = require('../middlewares/auth');

var appConfig = {
  appid: config.oauth.weibo.appid,
  appSecret: config.oauth.weibo.appSecret,
  redirectUri: config.domain+'/oauth/weibo-signin',
  scope: ''
}

var goToNoticePage = function(req, res, string) {
  // var landingPage = req.cookies['landing_page'] || config.oauth.landingPage;
  var landingPageDomain = req.cookies['landing_page_domain']
  res.redirect(landingPageDomain+'/notice?source=oauth_weibo&notice='+string)
}

var goToAutoSignin = function(req, res, jwtTokenSecret, userId, accessToken) {
  /*
  var ip = Tools.getIP(req);
  var result = JWT.encode(jwtTokenSecret, userId, accessToken, ip);
  var landingPage = config.oauth.landingPage; // req.cookies['landing_page'] ||
  res.redirect(config.oauth.landingPage+'/oauth?access_token='+result.access_token+'&expires='+result.expires)
  */

  var ip = Tools.getIP(req)
  var result = JWT.encode(jwtTokenSecret, userId, accessToken, ip)
  var landingPage = req.cookies['landing_page']
  var landingPageDomain = req.cookies['landing_page_domain']
  res.redirect(landingPageDomain+'/oauth?access_token='+result.access_token+'&expires='+result.expires+'&landing_page='+landingPage)

}

const signInAndSignUp = (user, authorize, _callback) => {

  async.waterfall([

    (callback) => {
      // 查询 oauth 是否存在
      Oauth.fetchByOpenIdAndSource(authorize.uid, 'weibo', (err, oauth) => {
        if (err) console.log(err);
        callback(null, oauth);
      });
    },

    (oauth, callback) => {

      if (user && oauth && oauth.deleted == false) {
        // 已经绑定
        callback('has_been_binding')
      } else if (user && oauth && oauth.deleted == true) {

        // 已经存在的 oauth
        Oauth.updateById(oauth._id, {
          access_token: authorize.access_token,
          expires_in: authorize.expires_in,
          refresh_token: authorize.remind_in,
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

        // 绑定账户
        var weibo = {
          access_token: authorize.access_token,
          expires_in: authorize.expires_in,
          refresh_token: authorize.remind_in,
          openid: authorize.uid,
          source: 'weibo',
          user_id: user._id
        };

        Oauth.create(weibo, function(err, user){
          if (err) console.log(err);
          callback('binding_finished')
        });

      } else if (!user && oauth && oauth.deleted == false) {
        // 登录
        callback(null, { user_id: oauth.user_id._id, access_token: oauth.user_id.access_token })
        // goToAutoSignin(req, res, req.jwtTokenSecret, oauth.user_id._id, oauth.user_id.access_token)
      } else if (!user && !oauth) {

        // 创建 oauth 并登陆
        getUserInfo(authorize.access_token, authorize.uid, function(info) {

          var user = {
            nickname: info.screen_name,
            gender: (info.gender === 'm' ? 1 : 0),
            avatar: info.avatar_hd,
            access_token: authorize.access_token,
            expires_in: authorize.expires_in,
            // refresh_token: authorize.remind_in,
            openid: authorize.uid,
            createDate: new Date(),
            source: 4
          };

          createUser(user, function(newUser){

            if (!newUser) {
              callback('create_user_failed')
              return
            }

            createOauth(user, newUser, function(oauth){
              if (oauth) {

                qiniu.uploadImage(user.avatar, newUser._id, function(){
                  callback(null, { user_id: newUser._id, access_token: newUser.access_token })
                  // goToAutoSignin(req, res, req.jwtTokenSecret, newUser._id, newUser.access_token)
                })

                // updateAvatar(user.avatar, newUser, function(){
                //   goToAutoSignin(res, req.jwtTokenSecret, newUser._id)
                // })
              } else {
                callback('create_oauth_failed')
              }
            })

          })

        });

      } else if (!user && oauth && oauth.deleted == true) {

        // 创建 oauth 并登陆
        getUserInfo(authorize.access_token, authorize.uid, function(info) {

          var user = {
            nickname: info.screen_name,
            gender: (info.gender === 'm' ? 1 : 0),
            avatar: info.avatar_hd,
            access_token: authorize.access_token,
            expires_in: authorize.expires_in,
            // refresh_token: authorize.remind_in,
            openid: authorize.uid,
            createDate: new Date(),
            source: 4
          };

          createUser(user, function(newUser){
            if (newUser) {
              Oauth.updateById(oauth._id, { user_id: newUser._id, deleted: false }, function(){
                qiniu.uploadImage(user.avatar, newUser._id, function(){
                  callback(null, { user_id: newUser._id, access_token: newUser.access_token })
                })
              })
            } else {
              callback('create_oauth_failed')
            }
          })

        });

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

// 授权页面
exports.show = function(req, res, next) {
  /*
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

  // req.session.csrf = csrf;
  // req.session.access_token = req.query.access_token || '';
  */

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

  res.redirect('https://api.weibo.com/oauth2/authorize?response_type=code&state='+csrf+'&client_id='+appConfig.appid+'&redirect_uri='+encodeURIComponent(appConfig.redirectUri)+'&scope='+appConfig.scope);
};


// 验证登录
exports.signin = function(req, res, next) {

  var user = null;
  var code = req.query.code;
  var state = req.query.state;
  var user_access_token = req.cookies['access_token']; //req.session.access_token;

  // 避免csrf攻击
  if (req.cookies['csrf'] != state) {
    res.redirect(config.domain+'/oauth/weibo');
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

    function(callback) {
      // 获取用户信息
      getAccessToken(code, function(userInfo){
        if (userInfo) {
          callback(null, userInfo);
        } else {
          // 获取不到则转转到登录页面
          res.redirect(appConfig.redirectUri);
        }
      });
    },

    function(userInfo, callback) {
      signInAndSignUp(user, userInfo, (err, result)=>{
        if (err) {
          goToNoticePage(req, res, err)
        } else {
          goToAutoSignin(req, res, req.jwtTokenSecret, result.user_id, result.access_token)
        }
      })
    }

  ], (err, user)=>{
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

      /*
      // 是否有效的 access_token
      User.fetchByAccessToken(access_token, function(err, user){
        if (err) console.log(err)
        if (user) {
          callback(null, user)
        } else {
          callback('access token error')
        }
      })
      */
    },
    function(user, callback) {
      // 查询是否存在
      Oauth.fetchByUserIdAndSource(user._id, 'weibo', function(err, oauth){
        if (err) console.log(err);
        if (!oauth) {
          callback('not binding weibo');
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


// 获取token
var getAccessToken = function(code, callback) {

  request.post(
    'https://api.weibo.com/oauth2/access_token?client_id='+appConfig.appid+'&client_secret='+appConfig.appSecret+'&grant_type=authorization_code&redirect_uri='+encodeURIComponent(appConfig.redirectUri)+'&code='+code,
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

// 获取用户信息
var getUserInfo = function(accessToken, uid, callback) {

  request.get(
    'https://api.weibo.com/2/users/show.json?access_token='+accessToken+'&uid='+uid+'&source='+appConfig.appid,
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

exports.getUserInfo = (req, res, next) => {

  const user = req.user || null;

  const { weibo_access_token, refresh_token, user_id, expiration_date } = req.body

  signInAndSignUp(user, {
    access_token: weibo_access_token,
    expires_in: new Date(expiration_date).getTime(),
    remind_in: refresh_token,
    uid: user_id,
    // createDate: new Date(),
    source: 4
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

/*
var getEmail = function(accessToken, uid, callback) {

  request.get(
    'https://api.weibo.com/2/account/profile/email.json?access_token='+accessToken+'&uid='+uid+'&source='+appConfig.appid,
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
*/

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
  user.source = 'weibo';

  Oauth.create(user, function(err, oauth){
    if (err) console.log(err);
    callback(oauth);

  });

}
