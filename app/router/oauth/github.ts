

import request from 'request';
import xss from 'xss';
import async from 'async';

import * as JWT from '../../utils/jwt';

// var JWT = require('../../common/jwt');
var Tools = require('../../common/tools');

// var User = require('../models').User;
// var Oauth = require('../models').Oauth;

import { User, Oauth, Token } from '../../models';


// var qiniu = require('../api/v1/qiniu');

import { uploadImage } from '../../graphql/resolvers/qiniu';

import config from '../../../config';

import OauthClass from './show';

class GithubClass extends OauthClass {
}

let github = new GithubClass({
  appid: config.oauth.github.appid,
  appkey: config.oauth.github.appkey,
  redirectUri: config.domain+'/oauth/github-signin',
  scope: 'user',
  redirectSignInUri: 'http://github.com/login/oauth/authorize?client_id={appid}&scope={scope}&state={csrf}&redirect_uri={redirectUri}'
});


// 重定向到第三方验证页面
export const githubSignIn = github.redirectSignIn();

var appConfig = {
  appid: config.oauth.github.appid,
  appkey: config.oauth.github.appkey,
  redirectUri: config.domain+'/oauth/github-signin',
  scope: 'user'
}

var goToNoticePage = function(req, res, string) {
  // var landingPage = req.cookies['landing_page'] || config.oauth.landingPage;
  var landingPageDomain = req.cookies['landing_page_domain']
  res.redirect(landingPageDomain+'/notice?source=oauth_github&notice='+string)
}

var goToAutoSignin = async function(req, res, jwtTokenSecret, userId, accessToken) {
  /*
  var ip = Tools.getIP(req);
  var result = JWT.encode(jwtTokenSecret, userId, accessToken, ip);
  var landingPage = config.oauth.landingPage;
  res.redirect(landingPage+'/oauth?access_token='+result.access_token+'&expires='+result.expires)
  */
  var ip = Tools.getIP(req)
  // var result = JWT.encode(jwtTokenSecret, userId, accessToken, ip)
  var result = await Token.create({ userId, ip })
  var landingPage = req.cookies['landing_page']
  var landingPageDomain = req.cookies['landing_page_domain']
  res.redirect(landingPageDomain+'/oauth?access_token='+result.access_token+'&expires='+result.expires+'&landing_page='+landingPage)
}



// 登陆验证
// http://wiki.connect.qq.com/使用authorization_code获取access_token
export const githubSignInCallback  = function(req, res) {

  var user = null;
  var code = req.query.code;
  var state = req.query.state;
  var user_access_token = req.cookies['access_token']; //req.session.access_token;

  // 避免csrf攻击
  if (req.cookies['csrf'] != state) {
    res.redirect(config.domain+'/oauth/github');
    return;
  }

  async.waterfall([

    async function(callback) {
      // 如果带有 access_token 那么，判断 access_token 是否有效
      if (!user_access_token) {
        callback(null)
        return
      }

      var decoded = JWT.decode(user_access_token);
      
      if (decoded && decoded.expires > new Date().getTime()) {
        // 判断 token 是否有效

        let [ err, _user ] = await To(User.findOne({ query: { _id: decoded.user_id } }));

        if (err) console.log(err);
        if (_user && _user[0]) {
          user = _user[0];
          callback(null);
        } else {
          goToNoticePage(req, res, 'wrong_token');
        }

        /*
        User.fetch({ _id: decoded.user_id }, {}, {}, function(err, _user){
          if (err) console.log(err);
          if (_user && _user[0]) {
            user = _user[0];
            callback(null);
          } else {
            goToNoticePage(req, res, 'wrong_token');
          }
        });
        */

      } else {
        goToNoticePage(req, res, 'wrong_token');
      }
    },

    // 获取访问令牌
    function(callback) {
      getAccessToken(code, state, function(err, params){
        if (!params) {
          res.redirect(appConfig.redirectUri);
        } else {
          callback(null, params);
        }
      });
    },

    // 获取 用户信息
    function(params, callback) {
      getUserinfo(req, params.access_token, function(userinfo){
        if (!userinfo) {
          res.redirect(appConfig.redirectUri);
          return
        }
        userinfo.openid = userinfo.id;
        userinfo.access_token = params.access_token;
        callback(null, userinfo);
      });
    },

    // 查询 openid 是否已经存在
    async function(userinfo, callback) {

      let [ err, oauth ] = await To(Oauth.fetchByOpenIdAndSource(userinfo.openid, 'github'));

      if (err) console.log(err);
      callback(null, userinfo, oauth);      

      // Oauth.fetchByOpenIdAndSource(userinfo.openid, 'github', function(err, oauth){
      //   if (err) console.log(err);
      //   callback(null, userinfo, oauth);
      // });
    },

    async function(tokenInfo, oauth, callback) {

      if (user && oauth && oauth.deleted == false) {
        // 绑定失败，账号已经被绑定
        goToNoticePage(req, res, 'has_been_binding')
      } else if (user && oauth && oauth.deleted == true) {

        let [ err ] = await To(Oauth.update({
          query: { _id: oauth._id },
          update: {
            access_token: tokenInfo.access_token,
            user_id: user._id,
            deleted: false
          }
        }));

        if (err) {
          console.log(err)
          goToNoticePage(req, res, 'binding_failed')
        } else {
          goToNoticePage(req, res, 'binding_finished')
        }

        /*
        // 绑定已经存在的 oauth
        Oauth.updateById(oauth._id, {
          access_token: tokenInfo.access_token,
          user_id: user._id,
          deleted: false
        }, function(err){
          if (err) {
            console.log(err)
            goToNoticePage(req, res, 'binding_failed')
          } else {
            goToNoticePage(req, res, 'binding_finished')
          }
        });
        */

      } else if (user && !oauth) {
        // 绑定到账户
        var qq = {
          openid: tokenInfo.openid,
          access_token: tokenInfo.access_token,
          source: 'github',
          user_id: user._id
        };

        /*
        Oauth.create(qq, function(err, user){
          if (err) console.log(err);
          goToNoticePage(req, res, 'binding_finished')
        });
        */

        let [ err ] = await To(Oauth.save({ data: qq }));

        if (err) console.log(err);
        goToNoticePage(req, res, 'binding_finished')


      } else if (!user && oauth && oauth.deleted == false) {

        // 登录
        goToAutoSignin(req, res, req.jwtTokenSecret, oauth.user_id._id, oauth.user_id.access_token)
      } else if (!user && !oauth) {

        // 创建 user，并绑定
        var _user = {
          nickname: tokenInfo.name || tokenInfo.login,
          avatar: tokenInfo.avatar_url,
          createDate: new Date(),
          gender: 1,
          source: 4
        }

        createUser(_user, function(user){

          if (!user) {
            goToNoticePage(req, res, 'create_user_failed')
            return
          }

          createOauth(tokenInfo, user, function(oauth){
            if (oauth) {
              uploadImage(tokenInfo.avatar_url, user._id, function(){
                goToAutoSignin(req, res, req.jwtTokenSecret, user._id, user.access_token)
              })
            } else {
              goToNoticePage(req, res, 'create_oauth_failed')
            }
          })

        })

      } else if (!user && oauth && oauth.deleted == true) {

        // oauth 是删除状态，绑定新账户，并恢复成可用状态
        var _user = {
          nickname: tokenInfo.name || tokenInfo.login,
          avatar: tokenInfo.avatar_url,
          createDate: new Date(),
          gender: 1,
          source: 4
        }

        createUser(_user, async function(user){

          if (!user) {
            goToNoticePage(req, res, 'create_oauth_failed');
            return;
          } 

          await To(Oauth.update({
            query: { _id: oauth._id },
            update: {
              user_id: user._id,
              deleted: false
            }
          }));

          uploadImage(tokenInfo.avatar_url, user._id, function(){
            goToAutoSignin(req, res, req.jwtTokenSecret, user._id, user.access_token)
          });

          /*
          Oauth.updateById(oauth._id, { user_id: user._id, deleted: false }, function(){
            uploadImage(tokenInfo.avatar_url, user._id, function(){
              goToAutoSignin(req, res, req.jwtTokenSecret, user._id, user.access_token)
            })
          })
          */

        })

      }
    }

  ], function(err, result) {

  });

};

/*
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
      Oauth.fetchByUserIdAndSource(user._id, 'github', function(err, oauth){
        if (err) console.log(err);
        if (!oauth) {
          callback('not binding github');
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
*/

// 获取用户的openid
var getUserinfo = function(req, access_token, callback) {

  var options = {
    url: 'https://api.github.com/user?access_token='+access_token,
    headers: {
      'Accept': 'application/json',
      'User-Agent': req.headers['user-agent']
    }
  };

  request.get(options, function (error, response, body) {

    body = JSON.parse(body)
    if (body && body.id) {
      callback(body)
    } else {
      callback(null)
    }
  });

};

// 获取 access token
var getAccessToken = function(code, state, callback) {

  request.post('https://github.com/login/oauth/access_token', {
    form: {
      client_id: appConfig.appid,
      client_secret: appConfig.appkey,
      code: code,
      redirect_uri: appConfig.redirectUri,
      state: state
    }
  }, function(err, response, body){

    if (err || response.statusCode != 200) {
      // 获取失败
      callback(err || response.statusCode, null);
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
  })


};

var createUser = async function(user, callback) {

  // xss过滤
  user.nickname = xss(user.nickname, {
    whiteList: {},
    stripIgnoreTag: true,
    onTagAttr: function (tag, name, value, isWhiteAttr) {
      return '';
    }
  });

  let [ err ] = await To(User.save({
    data: user
  }));

  if (err) console.log(err);
  callback(newUser)

  /*
  // 创建用户
  User.create(user, function(err, newUser){
    if (err) console.log(err);
    callback(newUser)
  });
  */

}

var createOauth = async function(user, newUser, callback) {

  user.user_id = newUser._id;
  user.source = 'github';

  let [ err ] = await To(Oauth.save({
    data: user
  }));

  if (err) console.log(err);
  callback(oauth);
  
  /*
  Oauth.create(user, function(err, oauth){
    if (err) console.log(err);
    callback(oauth);
  });
  */

}
