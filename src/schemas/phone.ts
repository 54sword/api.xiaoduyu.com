import mongoose from 'mongoose';
import cache from '@src/common/cache';

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const PhoneSchema = new Schema({
  // 区号
  area_code: { type: String },
  // 手机号码
  phone: { type:  String, unique: true },
  // 对应的用户信息
  user_id: { type: ObjectId, ref: 'User', unique: true },
  // 创建日期
  create_at: { type: Date, default: Date.now },
  // 删除状态
  deleted: { type: Boolean, default: false }
});

PhoneSchema.index({ phone: 1 });
PhoneSchema.index({ user_id: 1 });
PhoneSchema.index({ phone: 1, user_id: 1 }, { unique: true });

PhoneSchema.pre('save', async function(next) {
  let self: any = this;
  // 用户资料如果发生更新，从缓冲中删除用户的信息，让其重新从数据库中读取最新
  if (self && self.user_id) {
    // 主要需要将objectId转换成string
    cache.del(self.user_id+'');
  }
  next();
});

PhoneSchema.pre('updateOne', async function(next) {
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

mongoose.model('Phone', PhoneSchema);
