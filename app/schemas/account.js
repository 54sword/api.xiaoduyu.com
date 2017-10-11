
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var AccountSchema = new Schema({
  // 邮箱地址
  email: { type: String, lowercase: true, unique: true, trim: true },
  // 密码
  // password: String,

  // 对应的用户信息
  user_id: { type: ObjectId, ref: 'User' },
  create_at: { type: Date, default: Date.now },
  deleted: { type: Boolean, default: false }
});

/*
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
*/

AccountSchema.index({ email: 1 }, { unique: true });
AccountSchema.index({ user_id: 1 }, { unique: true });
AccountSchema.index({ email: 1, user_id: 1 }, { unique: true });

mongoose.model('Account', AccountSchema);
