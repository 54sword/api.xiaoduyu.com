
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

/*
 * type:
 * follow-posts: xx 关注了你的帖子
 * answer: xx 评论了你的主题
 * comment: xx 回复了你
 * follow-you: xx 关注了你
 * like-answer: xx 赞了你的答案
 * like-comment: xx 赞了你的评论
 * new-answer: xx 回答了 xx 问题
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


/**
1、用户获取通知
2、获取最近的查询时间,同 Notify 查询新的通知
3、如果有自己的新通知，那么写入到 Notification
4、查询 Notification 获取新的通知

 */
