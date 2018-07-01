
import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const AccountSchema = new Schema({
  // 邮箱地址
  email: { type: String, lowercase: true, unique: true, trim: true },
  // 对应的用户信息
  user_id: { type: ObjectId, ref: 'User' },
  // 创建日期
  create_at: { type: Date, default: Date.now },
  deleted: { type: Boolean, default: false }
});

AccountSchema.index({ email: 1 }, { unique: true });
AccountSchema.index({ user_id: 1 }, { unique: true });
AccountSchema.index({ email: 1, user_id: 1 }, { unique: true });

mongoose.model('Account', AccountSchema);
