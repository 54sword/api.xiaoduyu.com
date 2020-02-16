import mongoose from 'mongoose';
import cache from '../common/cache';

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

AccountSchema.pre('save', async function(next) {
  let self: any = this;
  // 用户资料如果发生更新，从缓冲中删除用户的信息，让其重新从数据库中读取最新
  if (self && self.user_id) {
    // 主要需要将objectId转换成string
    cache.del(self.user_id+'');
  }
  next();
});

AccountSchema.pre('updateOne', async function(next) {
  let self: any = this;
  // 用户资料如果发生更新，从缓冲中删除用户的信息，让其重新从数据库中读取最新
  if (self && self._conditions && self._conditions._id) {
    await self.findOne({ _id: self._conditions._id })
    .then((res: any)=>{
      // 主要需要将objectId转换成string
      cache.del(res.user_id+'');
    })
  }
  next();
});

AccountSchema.index({ email: 1 }, { unique: true });
AccountSchema.index({ user_id: 1 }, { unique: true });
AccountSchema.index({ email: 1, user_id: 1 }, { unique: true });

mongoose.model('Account', AccountSchema);
