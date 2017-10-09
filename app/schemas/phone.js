
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var PhoneSchema = new Schema({
  // 手机号码
  phone: { type: String, lowercase: true, unique: true },
  // 对应的用户信息
  user_id: { type: ObjectId, ref: 'User' },
  create_at: { type: Date, default: Date.now },
  deleted: { type: Boolean, default: false }
});

PhoneSchema.index({ phone: 1 }, { unique: true });
PhoneSchema.index({ user_id: 1 }, { unique: true });
PhoneSchema.index({ phone: 1, user_id: 1 }, { unique: true });

mongoose.model('Phone', PhoneSchema);
