
var User = require('../../../models').User;
var Account = require('../../../models').Account;
// var jwt = require('jwt-simple');
var JWT = require('../../../common/jwt');

// 验证token
var verifyToken = function(req, callback) {

  var token = String(req.headers.accesstoken || req.body.access_token || '');

  if (!token || token == 'undefined') {
    callback(false);
    return;
  }

  var decoded = JWT.decode(token, req.jwtTokenSecret);

  if (decoded && decoded.expires && decoded.expires > new Date().getTime()) {

    // 判断 token 是否有效
    User.fetch({ _id: decoded.user_id }, {}, {}, function(err, user){
      if (err) console.log(err);
      if (user && user[0]) {
        req.user = user[0];

        if (new Date().getTime() - new Date(user[0].last_sign_at).getTime() > 3600000) {
          User.update({ _id: user[0]._id }, { last_sign_at: new Date() }, function(err){
            if (err) console.log(err);
          })
        }

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
