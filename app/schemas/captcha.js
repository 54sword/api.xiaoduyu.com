

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var CaptchaSchema = new Schema({
  user_id: { type: ObjectId, ref: 'User' },
  phone: { type: String },
  email: { type: String, lowercase: true, trim: true },
  captcha: { type: String, required: true },
  ip: { type: String },
  // type: { type: Number, default: 0 },
  create_at: { type: Date, expires: 60*15, default: Date.now } // 半小时后自动删除
});

mongoose.model('Captcha', CaptchaSchema);
