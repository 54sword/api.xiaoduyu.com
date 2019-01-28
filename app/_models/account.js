var Account = require('../schemas').Account;
var bcrypt = require('bcryptjs');

exports.find = function(query, select, options, callback) {
  var find = Account.find(query, select)
  for (var i in options) {
    find[i](options[i])
  }
  find.exec(callback)
}

exports.create = function(info, callback) {
  var account = new Account();
  account.email = info.email;
  // account.password = info.password;
  account.user_id = info.user_id;
  account.save(callback);
};

// 通过邮箱查找一个用户
exports.fetchByEmail = function(email, callback) {
  Account.findOne({ email: email })
  .populate([
    {
      path: 'user_id'
    }
  ])
  .exec(callback);
};

// 通过用户的id查找
exports.fetchByUserId = function(userId, callback) {
  Account.findOne({ user_id: userId })
  .populate([
    {
      path: 'user_id'
    }
  ])
  .exec(callback);
};

// 验证密码是否正确
exports.verifyPassword = function(password, currentPassword, callback) {
  bcrypt.compare(password, currentPassword, function(err, res){
    if (err) console.log(err);
    callback(res ? true : false);
  });
};

// 更新邮箱
exports.updateEmail = function(id, email, callback) {
  Account.update({ _id: id }, { email: email }).exec(callback);
};

/*
// 更新邮箱验证状态
exports.updateEmailVerify = function(id, bl, callback) {
  Account.update({ _id: id }, { email_verify: bl }).exec(callback);
};
*/

// 重置密码
exports.resetPassword = function(id, newPassword, callback) {

  bcrypt.genSalt(10, function(err, salt) {
    if (err) return callback(err);

    bcrypt.hash(newPassword, salt, function(err, hash) {
      if (err) return callback(err);

      var conditions = { _id: id },
          update = { $set: { password: hash, salt: salt } },
          options = { upsert: true };

      Account.update(conditions, update, options, function(err){
        callback(err, hash);
      });

    });
  });

};

/*
// 更新更改密码口令
exports.setPasswordCaptcha = function(id, captcha, callback) {

  var conditions = { _id: id };
  var update = { $set: {
    reset_password_captcha: captcha,
    // 有效时间一个小时
    reset_password_expire: Date.now() + 3600000
  }};

  Account.update(conditions, update).exec(callback);

};

exports.updateEmailVerifyCaptcha = function(id, captcha, callback) {
  var conditions = { _id: id };
  var update = { $set: {
    // replace_email: email,
    verify_email_captcha: captcha,
    // 有效时间一个小时
    verify_email_captcha_expire: Date.now() + 3600000
  }};

  Account.update(conditions, update).exec(callback);
};


// 设置替换邮箱
exports.setRepaceEmail = function(id, email, callback) {
  var conditions = { _id: id };
  var update = { $set: {
    replace_email: email
  }};
  Account.update(conditions, update).exec(callback);
};
*/
