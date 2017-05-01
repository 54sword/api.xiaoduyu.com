
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

/*
 * type:
 * new-comment: xx 评论了 xx 帖子
 */

// 通知多人
var NotificationSchema = new Schema({
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

// Notify.index({ addressee_id: 1 });
// Notify.index({ addressee_id: 1, create_at: -1, deleted: 1 });

mongoose.model('Notification', NotificationSchema);
