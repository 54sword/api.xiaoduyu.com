
var User = require('../../../models').User;
var Token = require('../../../models').Token;
// var Account = require('../../../models').Account;
// var jwt = require('jwt-simple');
var JWT = require('../../../common/jwt');

// 验证token
var verifyToken = function(req, callback) {

  var token = String(req.headers.accesstoken || '');

  var role = String(req.headers.role || '')

  if (!token || token == 'undefined') {
    callback(false);
    return;
  }

  let decoded = JWT.decode(token, req.jwtTokenSecret)

  // console.log(decoded);

  // 解析错误
  if (!decoded) return callback(false)

  if (decoded && decoded.expires && decoded.expires < new Date().getTime()) {
    return callback(false)
  }

  // console.log('token在有效期内');

  // 判断 token 是否有效
  Token.findOne(
    { user_id: decoded.user_id, token: token },
    {},
    {
      populate: {
        path: 'user_id'
      }
    },
    function(err, result){
    if (err) console.log(err);

    if (result) {
      let user = result.user_id;

      // console.log(user);

      req.user = user;

      // 如果是管理员，并且是admin
      if (user.role == 100 && role == 'admin') {
        req.role = 'admin'
      }

      // console.log(user);

      // 最近登录时间，根据请求时间，每5分钟更新一次
      if (new Date().getTime() - new Date(user.last_sign_at).getTime() > 1000 * 60 * 5) {
        User.update({ _id: user._id }, { last_sign_at: new Date() }, function(err){
          if (err) console.log(err);
        })
      }

      // 判断访问令牌是否正确
      // if (!decoded.access_token || decoded.access_token != user[0].access_token) {
      //   callback(false);
      //   return
      // }

      callback(true);
    } else {
      callback(false);
    }
  });

  /*
  return

  var decoded = JWT.decode(token, req.jwtTokenSecret);

  // if (decoded && decoded.expires && decoded.expires > new Date().getTime()) {
  if (decoded) {

    // 判断 token 是否有效
    User.fetch({ _id: decoded.user_id }, {}, {}, function(err, user){
      if (err) console.log(err);

      if (user && user[0]) {
        req.user = user[0];

        // 最近登录时间，根据请求时间，每5分钟更新一次
        if (new Date().getTime() - new Date(user[0].last_sign_at).getTime() > 1000 * 60 * 5) {
          User.update({ _id: user[0]._id }, { last_sign_at: new Date() }, function(err){
            if (err) console.log(err);
          })
        }

        // 判断访问令牌是否正确
        if (!decoded.access_token || decoded.access_token != user[0].access_token) {
          callback(false);
          return
        }

        callback(true);
      } else {
        callback(false);
      }
    });
  } else {
    callback(false)
  }
  */

};

// 开放式，如果有token就验证，没有就跳过
exports.openType = function(req, res, next) {
  verifyToken(req, function(result){
    next()
  })
}

// 注册用户
exports.userRequired = function(req, res, next) {

  verifyToken(req, function(result){

    if (!result) {
      return res.status(401).send({
        success: false,
        error: 10006
      });
    } else if (req.user.blocked) {
      return res.status(403).send({
        success: false,
        error: 10007
      });
    } else {
      next();
    }
  });

};

exports.adminRequired = function(req, res, next) {

  // if (!req.headers.Authorization || req.headers.Authorization != 'admin') {
  //   return res.status(403).send({
  //     success: false,
  //     error: 10007
  //   })
  // }

  verifyToken(req, function(result){

    if (!result) {
      return res.status(401).send({
        success: false,
        error: 10006
      });
    } else if (req.user.role != 100) {
      return res.status(403).send({
        success: false,
        error: 10007
      });
    } else {
      next();
    }
  });

};

import isJSON from 'is-json'
// import _posts from '../params-white-list/posts'
import checkParams from '../params-white-list'

// const checkParams = (dataJSON) => {
//   return _checkParams(dataJSON, _posts)
// }

// 验证参数
exports.verifyArguments = (schemaName) => {
  return (req, res, next) =>{

    // 请求的json对象
    let JSONData = null

    if (req.method === 'GET') {
  		let json = req.query[0] || ''
  		if (!isJSON(json)) return res.send({ error: 11000, success: false })
  		JSONData = JSON.parse(json)
  	} else if (req.method === 'POST') {
  		JSONData = req.body
  	}

    // 检查参数是否合法
    JSONData = checkParams(JSONData, schemaName)
    // 如果有非法参数，返回错误
    if (Reflect.has(JSONData, 'success') && Reflect.has(JSONData, 'error')) {
      return res.send(JSONData)
    }

    req.arguments = JSONData

    next()
  }
}
