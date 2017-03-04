var Captcha = require('../schemas').Captcha;

exports.fetchByEmail = function(email, callback) {
  Captcha.findOne({ email: email })
  .sort({ 'create_at': -1 })
  .exec(callback)
}

exports.fetchByUserId = function(userId, callback) {
  Captcha.findOne({ user_id: userId })
  .sort({ 'create_at': -1 })
  .exec(callback)
}

exports.addUserId = function(userId, captcha, callback) {
  var captcha = new Captcha({
    user_id: userId,
    captcha: captcha
  });
  captcha.save(callback);
}

exports.addEmail = function(email, captcha, callback) {
  var captcha = new Captcha({
    email: email,
    captcha: captcha
  });
  captcha.save(callback);
}

exports.add = function(info, callback) {
  var captcha = new Captcha(info);
  captcha.save(callback);
}

exports.remove = function(id, callback) {
  new Captcha({ _id: id}).remove(callback);
}
