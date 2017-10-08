
var jwt = require('jsonwebtoken');
var Token = require('../models').Token;


exports.encode = function(jwtTokenSecret, userId, accessToken, ip) {

  let token = jwt.sign({
    expires: new Date().getTime() + 1000 * 60 * 60 * 24 * 30,
    // exp: Math.floor(Date.now() / 1000) + 30, //* 60 * 24,
    user_id: userId
    // access_token: accessToken
  }, jwtTokenSecret);

  // 储存token记录
  Token.save({
    user_id: userId,
    token: token,
    ip
  }, (err)=>{
    if (err) console.log(err)
  })

  return {
    user_id: userId,
    access_token: token
  }

}

exports.decode = function(token, jwtTokenSecret) {
  try {
    return jwt.verify(token, jwtTokenSecret)
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
