
import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const SessionSchema = new Schema({
  // 发件人
  user_id: { type: ObjectId, ref: 'User' },
  // 接收人
  addressee_id: { type: ObjectId, ref: 'User' },
  // 最近一条消息
  last_message: { type: ObjectId, ref: 'Message' },
  // 创建日期
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now }
});

mongoose.model('Session', SessionSchema);
