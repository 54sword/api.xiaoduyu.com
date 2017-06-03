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

exports.remove = function(conditions, callback) {
  // console.log(conditions);
  // Model.remove(conditions, callback);
  Captcha.remove(conditions, callback);
}


exports.findOne = function(query, select, options, callback) {
  var find = Captcha.findOne(query, select)
  for (var i in options) {
    find[i](options[i])
  }
  find.exec(callback)
}

/*
var captcha = new Captcha({ captcha: 123456 });
captcha.save(function(err, res){
  console.log(res._id);
});
*/
