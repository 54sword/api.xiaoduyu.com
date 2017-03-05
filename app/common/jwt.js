var jwt = require('jwt-simple');

exports.encode = function(jwtTokenSecret, userId) {

  var expires = new Date().getTime() + (1000 * 60 * 60 * 24 * 30);
  var token = jwt.encode({
    user_id: userId,
    expires: expires
  }, jwtTokenSecret);

  return {
    expires: expires,
    access_token: token
  }

}

exports.decode = function(token, jwtTokenSecret) {
  return jwt.decode(token, jwtTokenSecret) || null;
}
