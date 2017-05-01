var jwt = require('jwt-simple');

exports.encode = function(jwtTokenSecret, userId, accessToken) {

  var expires = new Date().getTime() + (1000 * 60 * 60 * 24 * 30);
  var token = jwt.encode({
    user_id: userId,
    expires: expires,
    access_token: accessToken
  }, jwtTokenSecret);

  return {
    expires: expires,
    access_token: token
  }

}

exports.decode = function(token, jwtTokenSecret) {
  return jwt.decode(token, jwtTokenSecret) || null;
}
