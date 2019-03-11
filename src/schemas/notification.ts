
import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

/*
 * type:
 * new-comment: xx 评论了 xx 帖子
 */

// 通知多人
const NotificationSchema = new Schema({
  // 发送人
  sender_id: { type: ObjectId, ref: 'User' },
  // 接收人
  addressee_id: [{ type: ObjectId, ref: 'User' }],
  // 目标的ID
  target: { type: ObjectId },
  // 提醒信息的动作类型
  type: { type: String },
  deleted: { type: Boolean, default: false },
  create_at: { type: Date, default: Date.now }
});

NotificationSchema.index({ sender_id: 1, addressee_id: 1, target: 1, type: 1 }, { unique: true });

mongoose.model('Notification', NotificationSchema);
