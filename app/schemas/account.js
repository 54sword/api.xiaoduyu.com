
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var AccountSchema = new Schema({
  // 邮箱地址
  email: { type: String, lowercase: true, unique: true, trim: true },
  // 密码
  password: String,
  // 邮箱是否验证的状态
  email_verify: { type: Boolean, default: false },

  // 只有通过邮件修改密码才会使用到
  // 修改密码验证码
  reset_password_captcha: { type: String, default: '' },
  // 修改密码的有效时间
  reset_password_expire: { type: Date, default: Date.now },

  // 要更换的邮箱
  replace_email: { type: String, lowercase: true, trim: true },
  // 验证邮箱的验证码
  verify_email_captcha: { type: String, default: '' },
  // 验证邮箱的验证码的有效时间
  verify_email_captcha_expire: { type: Date, default: Date.now },

  // 对应的用户信息
  user_id: { type: ObjectId, ref: 'User' }
});

AccountSchema.pre('save', function(next){

  var that = this;

  if (!that.password) {
    next();
    return;
  }

  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(that.password, salt, function(err, hash) {
      if (err) return next(err);

      that.password = hash;
      next();
    });
  });

});

AccountSchema.index({ email: 1 }, { unique: true });
AccountSchema.index({ user_id: 1 }, { unique: true });
AccountSchema.index({ email: 1, user_id: 1 }, { unique: true });

mongoose.model('Account', AccountSchema);
