
var jwt = require('jsonwebtoken');
var Token = require('../models').Token;
import { jwt_secret } from '../../config';


exports.encode = function(jwtTokenSecret, userId, accessToken, ip, expires = 1000 * 60 * 60 * 24 * 30, options = {}) {

  expires = new Date().getTime() + expires;

  let token = jwt.sign({
    expires,
    // exp: Math.floor(Date.now() / 1000) + 30, //* 60 * 24,
    user_id: userId,
    options
    // access_token: accessToken
  }, jwt_secret);
  
  // 储存token记录
  Token.save({
    data: {
      user_id: userId,
      token: token,
      ip
    }
  });

  return {
    user_id: userId,
    access_token: token,
    expires
  }

}

exports.decode = function(token) {
  try {
    return jwt.verify(token, jwt_secret)
  } catch (e) {
    return null
  }
}



/*
exports.decode = function({ token, jwtTokenSecret, callback =()=>{} }) {
  jwt.verify(token, jwtTokenSecret, function(err, decoded) {
    callback(err, decoded)
  })
}
*/
